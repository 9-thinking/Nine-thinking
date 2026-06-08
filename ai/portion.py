def estimate_weight(width, height):

    area = width * height

    if area < 100000:
        return 150

    if area < 250000:
        return 300

    if area < 500000:
        return 450

    return 600