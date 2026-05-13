#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image


def is_green_residue(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, alpha = pixel
    return alpha > 0 and green > 90 and green > red + 24 and green > blue + 14


def cell_bounds(image: Image.Image, box: tuple[int, int, int, int]) -> tuple[int, int, int, int] | None:
    cell = image.crop(box).convert("RGBA")
    xs: list[int] = []
    ys: list[int] = []

    for y in range(cell.height):
        for x in range(cell.width):
            if cell.getpixel((x, y))[3] > 0:
                xs.append(x)
                ys.append(y)

    if not xs:
        return None

    return min(xs), min(ys), max(xs), max(ys)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate generated sprite sheet geometry and residue.")
    parser.add_argument("image", type=Path)
    parser.add_argument("--columns", type=int, required=True)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--expected-width", type=int)
    parser.add_argument("--expected-height", type=int)
    parser.add_argument("--min-padding", type=int, default=2)
    args = parser.parse_args()

    image = Image.open(args.image).convert("RGBA")
    failures: list[str] = []

    if args.expected_width and image.width != args.expected_width:
        failures.append(f"width {image.width} != expected {args.expected_width}")
    if args.expected_height and image.height != args.expected_height:
        failures.append(f"height {image.height} != expected {args.expected_height}")
    if image.width % args.columns != 0:
        failures.append(f"width {image.width} is not divisible by columns {args.columns}")
    if image.height % args.rows != 0:
        failures.append(f"height {image.height} is not divisible by rows {args.rows}")

    green_pixels = 0
    for pixel in image.getdata():
        if is_green_residue(pixel):
            green_pixels += 1
    if green_pixels:
        failures.append(f"{green_pixels} visible green-residue pixels remain")

    cell_width = image.width // args.columns
    cell_height = image.height // args.rows
    for row in range(args.rows):
        for column in range(args.columns):
            left = column * cell_width
            top = row * cell_height
            bounds = cell_bounds(image, (left, top, left + cell_width, top + cell_height))
            if bounds is None:
                failures.append(f"cell {row},{column} is empty")
                continue

            min_x, min_y, max_x, max_y = bounds
            if min_x < args.min_padding:
                failures.append(f"cell {row},{column} touches left padding: {min_x}px")
            if min_y < args.min_padding:
                failures.append(f"cell {row},{column} touches top padding: {min_y}px")
            if cell_width - 1 - max_x < args.min_padding:
                failures.append(f"cell {row},{column} touches right padding: {cell_width - 1 - max_x}px")
            if cell_height - 1 - max_y < args.min_padding:
                failures.append(f"cell {row},{column} touches bottom padding: {cell_height - 1 - max_y}px")

    if failures:
        print("Sprite QA failed:")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print(
        f"Sprite QA passed: {args.image} "
        f"({image.width}x{image.height}, {args.columns}x{args.rows}, cell {cell_width}x{cell_height})"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
