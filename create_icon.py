from PIL import Image, ImageDraw, ImageFont, ImageFilter
import io, urllib.request, sys

SIZE = 512
PADDING = 30

# Create base canvas
img = Image.new('RGBA', (SIZE, SIZE), (255, 255, 255, 255))
draw = ImageDraw.Draw(img)

# Rounded rectangle mask
mask = Image.new('L', (SIZE, SIZE), 0)
mdraw = ImageDraw.Draw(mask)
mdraw.rounded_rectangle([0, 0, SIZE-1, SIZE-1], radius=108, fill=255)

# === Draw Sun ===
sun_y = 62
sun_r = 28
# Sun glow
for r in range(60, 0, -1):
    alpha = int(20 * (1 - r/60))
    draw.ellipse([SIZE//2 - r, sun_y - r, SIZE//2 + r, sun_y + r], 
                 fill=(251, 191, 36, alpha))
# Sun circle
draw.ellipse([SIZE//2 - sun_r, sun_y - sun_r, SIZE//2 + sun_r, sun_y + sun_r], 
             fill=(245, 158, 11))
# Sun rays
import math
for angle in [0, 45, 90, 135, 180]:
    rad = math.radians(angle - 90)
    x1 = SIZE//2 + int(math.cos(rad) * (sun_r + 8))
    y1 = sun_y + int(math.sin(rad) * (sun_r + 8))
    x2 = SIZE//2 + int(math.cos(rad) * (sun_r + 22))
    y2 = sun_y + int(math.sin(rad) * (sun_r + 22))
    draw.line([x1, y1, x2, y2], fill=(245, 158, 11, 140), width=5)

# === Energy rays (dashed) ===
for dx in [-30, 0, 30]:
    for i in range(0, 50, 10):
        y = sun_y + sun_r + 15 + i
        x = SIZE//2 + dx + (dx * i // 40)
        draw.ellipse([x-2, y-1, x+2, y+1], fill=(245, 158, 11, 80))

# === Load Solar Panel image ===
try:
    # Try to load from local file
    panel_img = Image.open(sys.argv[1]).convert('RGBA')
    # Resize panel to fit top portion
    panel_w = 200
    panel_h = int(panel_img.height * panel_w / panel_img.width)
    if panel_h > 180:
        panel_h = 180
        panel_w = int(panel_img.width * panel_h / panel_img.height)
    panel_img = panel_img.resize((panel_w, panel_h), Image.LANCZOS)
    # Position panel
    px = (SIZE - panel_w) // 2
    py = 120
    img.paste(panel_img, (px, py), panel_img)
    print(f"Panel placed: {panel_w}x{panel_h} at ({px},{py})")
except Exception as e:
    print(f"Panel image error: {e}, drawing placeholder")
    # Fallback: draw a dark curved panel
    draw.rounded_rectangle([SIZE//2 - 90, 130, SIZE//2 + 90, 260], radius=6, 
                           fill=(30, 64, 175), outline=(37, 99, 235), width=2)

# === Load C1000 image ===
try:
    c1000_img = Image.open(sys.argv[2]).convert('RGBA')
    # Resize to fit bottom portion
    c_w = 260
    c_h = int(c1000_img.height * c_w / c1000_img.width)
    if c_h > 200:
        c_h = 200
        c_w = int(c1000_img.width * c_h / c1000_img.height)
    c1000_img = c1000_img.resize((c_w, c_h), Image.LANCZOS)
    cx = (SIZE - c_w) // 2
    cy = SIZE - c_h - 25
    img.paste(c1000_img, (cx, cy), c1000_img)
    print(f"C1000 placed: {c_w}x{c_h} at ({cx},{cy})")
except Exception as e:
    print(f"C1000 image error: {e}, drawing placeholder")
    draw.rounded_rectangle([SIZE//2-100, 300, SIZE//2+100, 460], radius=16,
                           fill=(42, 42, 42), outline=(100, 100, 100), width=2)

# Apply rounded mask
result = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
result.paste(img, mask=mask)

# Save outputs
result.save('/Users/florian/Claude/Anker Solix App/app/static/icon-512.png', 'PNG')
result.resize((192, 192), Image.LANCZOS).save('/Users/florian/Claude/Anker Solix App/app/static/icon-192.png', 'PNG')
result.resize((180, 180), Image.LANCZOS).save('/Users/florian/Claude/Anker Solix App/app/static/apple-touch-icon.png', 'PNG')
print("Icons saved: icon-512.png, icon-192.png, apple-touch-icon.png")
