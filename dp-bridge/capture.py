#!/usr/bin/env python3
"""
Captures one fingerprint image from the first libfprint device and writes
a PNG to stdout. This is what server.js's captureFingerprint() should shell
out to once you're ready to wire up real hardware.

This deliberately bypasses fprintd: fprintd's D-Bus API is built around
"does this scan match user X's stored print" (tied to a local Linux
account) and does not expose raw images. libfprint itself (which fprintd
wraps) does, via fp_device_capture(), which is what your existing frontend
needs -- it just wants a PNG, the same way the Windows WebSdk gives it one.

Requires (Debian/Ubuntu/Mint):
    sudo apt install gir1.2-fprint-2.0 python3-gi python3-pil

Test it standalone first:
    python3 capture.py > test.png
"""
import sys

import gi

gi.require_version("FPrint", "2.0")
from gi.repository import FPrint  # noqa: E402
from PIL import Image  # noqa: E402


def main():
    ctx = FPrint.Context()
    ctx.enumerate()
    devices = ctx.get_devices()
    if not devices:
        print("no fingerprint device found", file=sys.stderr)
        sys.exit(1)

    dev = devices[0]
    dev.open_sync()
    try:
        if not dev.has_feature(FPrint.DeviceFeature.CAPTURE):
            print(
                f"{dev.get_name()} does not support raw image capture "
                "via libfprint on this driver version",
                file=sys.stderr,
            )
            sys.exit(1)

        # wait_for_finger=True blocks until a finger is placed on the sensor
        img = dev.capture_sync(True, None)
        width, height = img.get_width(), img.get_height()
        pixels = bytes(img.get_data())

        Image.frombytes("L", (width, height), pixels).save(sys.stdout.buffer, format="PNG")
    finally:
        dev.close_sync()


if __name__ == "__main__":
    main()