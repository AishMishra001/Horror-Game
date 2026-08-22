import os
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

os.makedirs('public/textures/ravi', exist_ok=True)
upload_dir = '/Users/aishmishra/.gemini/antigravity-ide/brain/0caad8a7-e387-48fc-a5f1-57bd52d3d600/.user_uploaded/'

# Load user uploaded source photos
im1 = Image.open(os.path.join(upload_dir, 'media_1787315085857.png')).convert('RGBA')
im2 = Image.open(os.path.join(upload_dir, 'media_1787315096962.png')).convert('RGBA')

# ══════════════════════════════════════════════════════════════════════════════
# 1. GENERATE 2048x2048 DIFFUSE MASTER ATLAS
# ══════════════════════════════════════════════════════════════════════════════
atlas_diffuse = Image.new('RGB', (2048, 2048), (24, 24, 30))
atlas_roughness = Image.new('RGB', (2048, 2048), (140, 140, 140)) # Default mid-roughness
atlas_height = Image.new('L', (2048, 2048), 128) # Mid-gray height for normal map

# ──────────────────────────────────────────────────────────────────────────────
# QUADRANT 1: TOP-LEFT (0, 0) to (1024, 1024) -> HEAD, FACE, HAIR, EARS, NECK
# UV Range: U [0.0, 0.5], V [0.5, 1.0]
# ──────────────────────────────────────────────────────────────────────────────
head_tile = Image.new('RGB', (1024, 1024), (200, 148, 108)) # Base skin tone
head_rough = Image.new('RGB', (1024, 1024), (115, 115, 115)) # Skin roughness ~0.45
head_h = Image.new('L', (1024, 1024), 128)

# Add skin micro-texture noise
h_arr = np.array(head_tile, dtype=np.float32)
noise = np.random.normal(0, 4.0, (1024, 1024, 3))
h_arr = np.clip(h_arr + noise, 0, 255).astype(np.uint8)
head_tile = Image.fromarray(h_arr)

# Stylized Pompadour Hair area (top half & back sides)
draw_head = ImageDraw.Draw(head_tile)
draw_hrough = ImageDraw.Draw(head_rough)
draw_hh = ImageDraw.Draw(head_h)

# Hair region: Top & upper sides
draw_head.rectangle([(0, 0), (1024, 360)], fill=(18, 14, 12))
draw_hrough.rectangle([(0, 0), (1024, 360)], fill=(85, 85, 85)) # Hair roughness ~0.33
draw_hh.rectangle([(0, 0), (1024, 360)], fill=165) # Hair height

# Hair sideburns
draw_head.polygon([(0, 360), (220, 360), (180, 520), (0, 520)], fill=(20, 16, 14))
draw_head.polygon([(1024, 360), (804, 360), (844, 520), (1024, 520)], fill=(20, 16, 14))

# Hair strand texture lines
for y_line in range(20, 350, 12):
    draw_head.line([(0, y_line), (1024, y_line + 15)], fill=(32, 26, 22), width=3)
    draw_hh.line([(0, y_line), (1024, y_line + 15)], fill=195, width=3)

# Extract High-Res Front Face from Ravi Kishan Photo (media_1787315085857.png)
face_raw = im1.crop((95, 25, 295, 225)).convert('RGB')
face_raw = face_raw.resize((560, 580), Image.Resampling.LANCZOS)

# Enhance realism & contrast of the face
face_enhanced = ImageEnhance.Sharpness(face_raw).enhance(2.6)
face_enhanced = ImageEnhance.Contrast(face_enhanced).enhance(1.22)
face_enhanced = ImageEnhance.Color(face_enhanced).enhance(1.10)

# Create feathered organic blend mask for the face
face_mask = Image.new('L', (560, 580), 0)
draw_fmask = ImageDraw.Draw(face_mask)
draw_fmask.ellipse((20, 10, 540, 570), fill=255)
face_mask = face_mask.filter(ImageFilter.GaussianBlur(radius=24))

# Paste enhanced face onto head tile centered at (232, 210)
head_tile.paste(face_enhanced, (232, 210), face_mask)

# Horror eye socket darkening on diffuse
draw_head.ellipse((340, 320, 420, 380), outline=(50, 20, 20), width=3)
draw_head.ellipse((604, 320, 684, 380), outline=(50, 20, 20), width=3)

# Cheeks & Neck shading
draw_head.polygon([(360, 780), (664, 780), (740, 1024), (284, 1024)], fill=(182, 132, 94))

atlas_diffuse.paste(head_tile, (0, 0))
atlas_roughness.paste(head_rough, (0, 0))
atlas_height.paste(head_h, (0, 0))


# ──────────────────────────────────────────────────────────────────────────────
# QUADRANT 2: TOP-RIGHT (1024, 0) to (2048, 1024) -> ROYAL BLUE SUIT JACKET & SHIRT
# UV Range: U [0.5, 1.0], V [0.5, 1.0]
# ──────────────────────────────────────────────────────────────────────────────
suit_tile = Image.new('RGB', (1024, 1024), (26, 68, 195)) # Royal Blue base
suit_rough = Image.new('RGB', (1024, 1024), (165, 165, 165)) # Fabric roughness ~0.65
suit_h = Image.new('L', (1024, 1024), 128)

# Procedural fine fabric twill weave
s_arr = np.array(suit_tile, dtype=np.float32)
y_grid, x_grid = np.indices((1024, 1024))
twill_pattern = (np.sin(x_grid * 1.2 + y_grid * 1.2) * 5.0).astype(np.float32)
for c in range(3):
    s_arr[:, :, c] += twill_pattern
suit_tile = Image.fromarray(np.clip(s_arr, 0, 255).astype(np.uint8))

draw_suit = ImageDraw.Draw(suit_tile)
draw_srough = ImageDraw.Draw(suit_rough)
draw_sh = ImageDraw.Draw(suit_h)

# Crisp White Collared Shirt V-Neck (Center Chest)
draw_suit.polygon([(256, 380), (170, 30), (342, 30)], fill=(252, 252, 254))
draw_srough.polygon([(256, 380), (170, 30), (342, 30)], fill=(180, 180, 180)) # Cotton shirt
draw_sh.polygon([(256, 380), (170, 30), (342, 30)], fill=135)

# Popped White Shirt Collar Wings
draw_suit.polygon([(170, 30), (110, 5), (200, 85)], fill=(255, 255, 255))
draw_suit.polygon([(342, 30), (402, 5), (312, 85)], fill=(255, 255, 255))
draw_sh.polygon([(170, 30), (110, 5), (200, 85)], fill=155)
draw_sh.polygon([(342, 30), (402, 5), (312, 85)], fill=155)

# Wide Peaked Royal Blue Lapels with Dark Blue Inner Shadow
draw_suit.polygon([(125, 45), (256, 420), (180, 420), (95, 150), (75, 130), (135, 90)], fill=(18, 48, 142))
draw_suit.polygon([(387, 45), (256, 420), (332, 420), (417, 150), (437, 130), (377, 90)], fill=(18, 48, 142))
draw_sh.polygon([(125, 45), (256, 420), (180, 420), (95, 150), (75, 130), (135, 90)], fill=160)
draw_sh.polygon([(387, 45), (256, 420), (332, 420), (417, 150), (437, 130), (377, 90)], fill=160)

# Lapel border stitch lines
draw_suit.line([(125, 45), (75, 130), (95, 150), (256, 420)], fill=(12, 32, 105), width=3)
draw_suit.line([(387, 45), (437, 130), (417, 150), (256, 420)], fill=(12, 32, 105), width=3)

# Breast Pocket & Crisp White Pocket Square with Blue Accents (Left Chest)
draw_suit.rectangle([(85, 295), (165, 312)], fill=(15, 38, 115))
draw_suit.polygon([(95, 295), (125, 245), (155, 295)], fill=(255, 255, 255))
draw_sh.polygon([(95, 295), (125, 245), (155, 295)], fill=175) # Pocket square height
# Blue polka dots on pocket square
for px in range(104, 148, 8):
    draw_suit.ellipse((px - 2, 268, px + 2, 273), fill=(26, 68, 195))

# 6 Metallic Embossed Gold Buttons (2 columns of 3)
for by in [460, 570, 680]:
    # Left column (x=196)
    draw_suit.ellipse((176, by - 20, 216, by + 20), fill=(245, 190, 45), outline=(255, 225, 80), width=3)
    draw_suit.ellipse((186, by - 10, 206, by + 10), fill=(255, 235, 110))
    draw_srough.ellipse((176, by - 20, 216, by + 20), fill=(35, 35, 35)) # Highly reflective
    draw_sh.ellipse((176, by - 20, 216, by + 20), fill=210) # Embossed button dome

    # Right column (x=316)
    draw_suit.ellipse((296, by - 20, 336, by + 20), fill=(245, 190, 45), outline=(255, 225, 80), width=3)
    draw_suit.ellipse((306, by - 10, 326, by + 10), fill=(255, 235, 110))
    draw_srough.ellipse((296, by - 20, 336, by + 20), fill=(35, 35, 35))
    draw_sh.ellipse((296, by - 20, 336, by + 20), fill=210)

# Lower Flap Pockets
draw_suit.rectangle([(65, 630), (175, 668)], fill=(18, 48, 142), outline=(12, 32, 100), width=3)
draw_suit.rectangle([(337, 630), (447, 668)], fill=(18, 48, 142), outline=(12, 32, 100), width=3)
draw_sh.rectangle([(65, 630), (175, 668)], fill=150)
draw_sh.rectangle([(337, 630), (447, 668)], fill=150)

# Back Jacket Tailored Seams (Right half of tile)
draw_suit.line([(768, 20), (768, 1000)], fill=(12, 32, 105), width=5) # Center back spine seam
draw_suit.line([(620, 100), (620, 940)], fill=(16, 42, 125), width=3) # Side back seam
draw_suit.line([(916, 100), (916, 940)], fill=(16, 42, 125), width=3) # Side back seam
draw_sh.line([(768, 20), (768, 1000)], fill=110, width=5)

atlas_diffuse.paste(suit_tile, (1024, 0))
atlas_roughness.paste(suit_rough, (1024, 0))
atlas_height.paste(suit_h, (1024, 0))


# ──────────────────────────────────────────────────────────────────────────────
# QUADRANT 3: BOTTOM-LEFT (0, 1024) to (1024, 2048) -> TAILORED WHITE TROUSERS
# UV Range: U [0.0, 0.5], V [0.0, 0.5]
# ──────────────────────────────────────────────────────────────────────────────
pants_tile = Image.new('RGB', (1024, 1024), (246, 247, 250)) # Crisp white slacks
pants_rough = Image.new('RGB', (1024, 1024), (180, 180, 180)) # Cotton roughness ~0.70
pants_h = Image.new('L', (1024, 1024), 128)

p_arr = np.array(pants_tile, dtype=np.float32)
# Add realistic vertical ironed crease shadow and natural fabric weave
for leg_center in [256, 768]:
    crease_shadow = -32.0 * np.exp(-((x_grid - leg_center) / 10.0)**2)
    crease_highlight = 12.0 * np.exp(-((x_grid - (leg_center - 8)) / 6.0)**2)
    for c in range(3):
        p_arr[:, :, c] += crease_shadow + crease_highlight
pants_tile = Image.fromarray(np.clip(p_arr, 0, 255).astype(np.uint8))

draw_pants = ImageDraw.Draw(pants_tile)
draw_ph = ImageDraw.Draw(pants_h)

# Sharp ironed crease in height map
for leg_center in [256, 768]:
    draw_ph.line([(leg_center, 0), (leg_center, 1024)], fill=155, width=4)
    # Horizontal subtle knee break folds
    draw_pants.line([(leg_center - 140, 520), (leg_center + 140, 520)], fill=(225, 226, 230), width=3)
    draw_pants.line([(leg_center - 120, 540), (leg_center + 120, 540)], fill=(228, 229, 233), width=2)
    draw_ph.line([(leg_center - 140, 520), (leg_center + 140, 520)], fill=118, width=3)

# Trouser bottom hem stitching
draw_pants.line([(0, 980), (1024, 980)], fill=(215, 216, 220), width=3)

atlas_diffuse.paste(pants_tile, (0, 1024))
atlas_roughness.paste(pants_rough, (0, 1024))
atlas_height.paste(pants_h, (0, 1024))


# ──────────────────────────────────────────────────────────────────────────────
# QUADRANT 4: BOTTOM-RIGHT (1024, 1024) to (2048, 2048) -> SHOES, SOCKS, HANDS & ARMS
# UV Range: U [0.5, 1.0], V [0.0, 0.5]
# ──────────────────────────────────────────────────────────────────────────────
quad4_tile = Image.new('RGB', (1024, 1024), (20, 20, 26))
quad4_rough = Image.new('RGB', (1024, 1024), (128, 128, 128))
quad4_h = Image.new('L', (1024, 1024), 128)

draw_q4 = ImageDraw.Draw(quad4_tile)
draw_q4r = ImageDraw.Draw(quad4_rough)
draw_q4h = ImageDraw.Draw(quad4_h)

# Top-Left subquadrant (0..512, 0..512): Hands & Skin
draw_q4.rectangle([(0, 0), (512, 512)], fill=(198, 146, 106))
draw_q4r.rectangle([(0, 0), (512, 512)], fill=(120, 120, 120)) # Skin roughness
# Knuckle creases & palm contour
for ky in range(120, 400, 50):
    draw_q4.line([(60, ky), (450, ky)], fill=(168, 118, 82), width=3)
    draw_q4h.line([(60, ky), (450, ky)], fill=112, width=3)

# Bottom-Left subquadrant (0..512, 512..1024): White Dress Socks & Shirt Cuffs
draw_q4.rectangle([(0, 512), (512, 1024)], fill=(250, 250, 252))
draw_q4r.rectangle([(0, 512), (512, 1024)], fill=(175, 175, 175))
# Cuff gold links
draw_q4.ellipse((120, 600, 160, 640), fill=(245, 190, 45), outline=(255, 225, 80), width=2)
draw_q4.ellipse((360, 600, 400, 640), fill=(245, 190, 45), outline=(255, 225, 80), width=2)

# Right Half (512..1024, 0..1024): High-Gloss Black Oxford Shoes
draw_q4.rectangle([(512, 0), (1024, 1024)], fill=(12, 12, 16)) # Deep polished black
draw_q4r.rectangle([(512, 0), (1024, 1024)], fill=(45, 45, 45)) # Glossy leather roughness ~0.18

# Specular polish highlights on toe cap and vamp
draw_q4.ellipse((580, 160, 960, 480), fill=(36, 36, 46))
draw_q4.ellipse((640, 220, 900, 420), fill=(52, 52, 65))
draw_q4.ellipse((700, 260, 840, 370), fill=(78, 78, 95))

# Oxford shoe stitching and toe cap seam
draw_q4.line([(560, 460), (980, 460)], fill=(24, 24, 32), width=4)
draw_q4.line([(560, 465), (980, 465)], fill=(8, 8, 12), width=2)
draw_q4h.line([(560, 460), (980, 460)], fill=155, width=4)

# Leather sole edge (bottom)
draw_q4.rectangle([(512, 860), (1024, 1024)], fill=(8, 8, 10))
draw_q4r.rectangle([(512, 860), (1024, 1024)], fill=(200, 200, 200)) # Matte rubber/leather sole
draw_q4h.rectangle([(512, 860), (1024, 1024)], fill=95)

atlas_diffuse.paste(quad4_tile, (1024, 1024))
atlas_roughness.paste(quad4_rough, (1024, 1024))
atlas_height.paste(quad4_h, (1024, 1024))


# ══════════════════════════════════════════════════════════════════════════════
# 2. GENERATE HIGH-FREQUENCY NORMAL MAP FROM HEIGHT BUFFER (Sobel Filter)
# ══════════════════════════════════════════════════════════════════════════════
h_array = np.array(atlas_height, dtype=np.float32) / 255.0

# Calculate gradients (Sobel filter approximation)
sobel_x = np.zeros_like(h_array)
sobel_y = np.zeros_like(h_array)

sobel_x[:, 1:-1] = (h_array[:, 2:] - h_array[:, :-2]) * 2.8
sobel_y[1:-1, :] = (h_array[2:, :] - h_array[:-2, :]) * 2.8

normal_x = -sobel_x
normal_y = -sobel_y
normal_z = np.ones_like(h_array)

# Normalize vector (nx, ny, nz)
norm = np.sqrt(normal_x**2 + normal_y**2 + normal_z**2) + 1e-6
normal_x /= norm
normal_y /= norm
normal_z /= norm

# Map [-1, 1] to [0, 255] RGB standard normal format (R=X, G=Y, B=Z)
normal_rgb = np.zeros((2048, 2048, 3), dtype=np.uint8)
normal_rgb[:, :, 0] = np.clip((normal_x * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
normal_rgb[:, :, 1] = np.clip((normal_y * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)
normal_rgb[:, :, 2] = np.clip((normal_z * 0.5 + 0.5) * 255, 0, 255).astype(np.uint8)

atlas_normal = Image.fromarray(normal_rgb)

# Save high-resolution maps
diffuse_path = 'public/textures/ravi/ravi_character_atlas.jpg'
normal_path = 'public/textures/ravi/ravi_character_normal.jpg'
rough_path = 'public/textures/ravi/ravi_character_roughness.jpg'

atlas_diffuse.save(diffuse_path, quality=95)
atlas_normal.save(normal_path, quality=95)
atlas_roughness.save(rough_path, quality=90)

print(f'Successfully generated textures: {diffuse_path}, {normal_path}, {rough_path}')
