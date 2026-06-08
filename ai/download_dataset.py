from googleapiclient.discovery import build
import requests
import os

API_KEY = "AIzaSyAyeg8H3jJYovTGHvREjBGfPASa-I5ksLU"
CX = "d2c0ee1274bc241cf"

service = build(
    "customsearch",
    "v1",
    developerKey=API_KEY
)

foods = [
    "burger",
    "pizza",
    "fried rice",
    "nasi lemak",
    "roti canai",
    "satay",
    "chicken rice",
    "laksa",
    "mee goreng",
    "salad"
]

for food in foods:

    os.makedirs(
        f"dataset/{food.replace(' ','_')}",
        exist_ok=True
    )

    result = service.cse().list(
        q=f"{food} food",
        cx=CX,
        searchType="image",
        num=10
    ).execute()

    for i, item in enumerate(result["items"]):

        try:

            img = requests.get(
                item["link"],
                timeout=10
            )

            with open(
                f"dataset/{food.replace(' ','_')}/{i}.jpg",
                "wb"
            ) as f:
                f.write(img.content)

            print(food, i)

        except Exception as e:
            print(e)