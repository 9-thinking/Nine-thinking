import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import numpy as np

IMG_SIZE = 224
BATCH_SIZE = 8   # small batch for small dataset
EPOCHS_TRANSFER = 30
EPOCHS_FINETUNE = 20

DATASET_DIR = "dataset"

# ── Data Augmentation (aggressive for small dataset) ──────────────────────────
augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.3),
    layers.RandomZoom(0.2),
    layers.RandomContrast(0.2),
    layers.RandomBrightness(0.2),
    layers.RandomTranslation(0.1, 0.1),
], name="augmentation")

# ── Load datasets ─────────────────────────────────────────────────────────────
train_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="training",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATASET_DIR,
    validation_split=0.2,
    subset="validation",
    seed=42,
    image_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE
)

class_names = train_ds.class_names
num_classes = len(class_names)

print("\nClasses found:")
for c in class_names:
    print(f"  - {c}")
print(f"\nTotal classes: {num_classes}")

AUTOTUNE = tf.data.AUTOTUNE

# Apply augmentation + preprocessing only on training set
def augment_and_preprocess(image, label):
    image = augmentation(image, training=True)
    image = preprocess_input(image)
    return image, label

def preprocess_only(image, label):
    image = preprocess_input(image)
    return image, label

train_ds = train_ds.map(augment_and_preprocess, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)
val_ds   = val_ds.map(preprocess_only, num_parallel_calls=AUTOTUNE).prefetch(AUTOTUNE)

# ── Build Model (Transfer Learning Phase) ─────────────────────────────────────
base_model = MobileNetV2(
    input_shape=(IMG_SIZE, IMG_SIZE, 3),
    include_top=False,
    weights="imagenet"
)
base_model.trainable = False

inputs = tf.keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3))
x = base_model(inputs, training=False)
x = layers.GlobalAveragePooling2D()(x)
x = layers.BatchNormalization()(x)
x = layers.Dense(256, activation="relu")(x)
x = layers.Dropout(0.4)(x)
outputs = layers.Dense(num_classes, activation="softmax")(x)

model = models.Model(inputs, outputs)

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=8,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.5,
        patience=4,
        min_lr=1e-6
    )
]

print("\n=== Phase 1: Transfer Learning ===")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_TRANSFER,
    callbacks=callbacks
)

# ── Fine-Tuning Phase ──────────────────────────────────────────────────────────
print("\n=== Phase 2: Fine-tuning top layers ===")
base_model.trainable = True

# Freeze all layers except the last 30
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

history_fine = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS_FINETUNE,
    callbacks=callbacks
)

# ── Save model ────────────────────────────────────────────────────────────────
model.save("food_model.h5")
print("\n[OK] Model saved as food_model.h5")
print("Classes:", class_names)

# Print final accuracy
val_loss, val_acc = model.evaluate(val_ds, verbose=0)
print(f"Final Validation Accuracy: {val_acc*100:.1f}%")