import os
import trimesh
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import trimesh.visual.material

os.makedirs('public/models', exist_ok=True)
os.makedirs('public/textures/ravi', exist_ok=True)

upload_dir = '/Users/aishmishra/.gemini/antigravity-ide/brain/0caad8a7-e387-48fc-a5f1-57bd52d3d600/.user_uploaded/'
im1 = Image.open(os.path.join(upload_dir, 'media_1787315085857.png')).convert('RGBA')
im2 = Image.open(os.path.join(upload_dir, 'media_1787315096962.png')).convert('RGBA')

# ══════════════════════════════════════════════════════════════════════════════
# 1. BUILD HIGH-RESOLUTION MASTER 2048x2048 TEXTURE ATLAS
# ══════════════════════════════════════════════════════════════════════════════
atlas = Image.new('RGB', (2048, 2048), (28, 28, 36))

# ─── QUADRANT 1: TOP-LEFT (0..1024, 0..1024) -> HEAD, FACE, HAIR, NECK ──────
# In Three.js with flipY=false:
# V: 0.0 = top of image (hair), V: 0.5 = middle (neck)
# U: 0.0 = left edge, U: 0.5 = right edge
head_tile = Image.new('RGB', (1024, 1024), (205, 154, 112))
h_arr = np.array(head_tile, dtype=np.float32)
h_noise = np.random.normal(0, 3.0, (1024, 1024, 3))
head_tile = Image.fromarray(np.clip(h_arr + h_noise, 0, 255).astype(np.uint8))
draw_head = ImageDraw.Draw(head_tile)

# Styled Pompadour Hair (Top of head: rows 0 to 280)
draw_head.rectangle([(0, 0), (1024, 280)], fill=(18, 14, 12))
draw_head.polygon([(0, 280), (220, 280), (160, 480), (0, 480)], fill=(20, 16, 14))
draw_head.polygon([(1024, 280), (804, 280), (864, 480), (1024, 480)], fill=(20, 16, 14))

# Hair strand lines
for y_line in range(15, 275, 8):
    draw_head.line([(0, y_line), (1024, y_line + 10)], fill=(34, 28, 24), width=3)

# Extract High-Res Front Face from Ravi Kishan Photo (media_1787315085857.png)
# Ravi Kishan's actual head in media_1787315085857.png: x: 95..295, y: 25..225
face_raw = im1.crop((95, 25, 295, 225)).convert('RGB').resize((620, 640), Image.Resampling.LANCZOS)
face_enhanced = ImageEnhance.Sharpness(face_raw).enhance(2.8)
face_enhanced = ImageEnhance.Contrast(face_enhanced).enhance(1.22)
face_enhanced = ImageEnhance.Color(face_enhanced).enhance(1.15)

# Smooth feathered blend mask centered on the face
face_mask = Image.new('L', (620, 640), 0)
ImageDraw.Draw(face_mask).ellipse((30, 20, 590, 620), fill=255)
face_mask = face_mask.filter(ImageFilter.GaussianBlur(radius=20))

# Paste face in the exact center of head_tile: (202, 190)
head_tile.paste(face_enhanced, (202, 190), face_mask)

# Neck shading at the bottom of head_tile
draw_head.rectangle([(0, 830), (1024, 1024)], fill=(188, 138, 98))
draw_head.polygon([(360, 780), (664, 780), (740, 1024), (284, 1024)], fill=(182, 132, 94))

atlas.paste(head_tile, (0, 0))


# ─── QUADRANT 2: TOP-RIGHT (1024..2048, 0..1024) -> ROYAL BLUE SUIT & SHIRT ──
# V: 0.0 = top (collar/lapels), V: 0.5 = middle (jacket hem)
suit_tile = Image.new('RGB', (1024, 1024), (28, 75, 215)) # Vibrant royal blue
s_arr = np.array(suit_tile, dtype=np.float32)
y_grid, x_grid = np.indices((1024, 1024))
twill = (np.sin(x_grid * 1.5 + y_grid * 1.5) * 6.0).astype(np.float32)
for c in range(3):
    s_arr[:, :, c] += twill
suit_tile = Image.fromarray(np.clip(s_arr, 0, 255).astype(np.uint8))
draw_suit = ImageDraw.Draw(suit_tile)

# Crisp White Shirt V-Neck & Collar (Center: x = 512 in suit_tile)
draw_suit.polygon([(512, 380), (426, 30), (598, 30)], fill=(255, 255, 255))
draw_suit.polygon([(426, 30), (361, 5), (451, 85)], fill=(252, 252, 252))
draw_suit.polygon([(598, 30), (663, 5), (573, 85)], fill=(252, 252, 252))

# Wide Peaked Royal Blue Lapels
draw_suit.polygon([(381, 45), (512, 420), (436, 420), (351, 150), (331, 130), (391, 90)], fill=(18, 50, 155))
draw_suit.polygon([(643, 45), (512, 420), (588, 420), (673, 150), (693, 130), (633, 90)], fill=(18, 50, 155))
draw_suit.line([(381, 45), (331, 130), (351, 150), (512, 420)], fill=(12, 34, 110), width=4)
draw_suit.line([(643, 45), (693, 130), (673, 150), (512, 420)], fill=(12, 34, 110), width=4)

# Breast Pocket & Crisp White Pocket Square with Blue Dots (Left Chest: x = 360..440)
draw_suit.rectangle([(341, 295), (421, 312)], fill=(15, 40, 125))
draw_suit.polygon([(351, 295), (381, 245), (411, 295)], fill=(255, 255, 255))
for px in range(360, 404, 8):
    draw_suit.ellipse((px - 2, 268, px + 2, 273), fill=(28, 75, 215))

# 6 Metallic Embossed Gold Buttons (2 columns of 3)
for by in [460, 570, 680]:
    # Left column (x = 452)
    draw_suit.ellipse((432, by - 20, 472, by + 20), fill=(250, 200, 50), outline=(255, 235, 95), width=3)
    draw_suit.ellipse((442, by - 10, 462, by + 10), fill=(255, 245, 130))
    # Right column (x = 572)
    draw_suit.ellipse((552, by - 20, 592, by + 20), fill=(250, 200, 50), outline=(255, 235, 95), width=3)
    draw_suit.ellipse((562, by - 10, 582, by + 10), fill=(255, 245, 130))

# Flap pockets (Left & Right)
draw_suit.rectangle([(321, 630), (431, 668)], fill=(18, 50, 155), outline=(12, 34, 105), width=3)
draw_suit.rectangle([(593, 630), (703, 668)], fill=(18, 50, 155), outline=(12, 34, 105), width=3)

# Back tailored seams
draw_suit.line([(100, 20), (100, 1000)], fill=(12, 34, 105), width=5)
draw_suit.line([(924, 20), (924, 1000)], fill=(12, 34, 105), width=5)

atlas.paste(suit_tile, (1024, 0))


# ─── QUADRANT 3: BOTTOM-LEFT (0..1024, 1024..2048) -> TAILORED WHITE SLACKS ──
# V: 0.5 = top (waist), V: 1.0 = bottom (ankle)
pants_tile = Image.new('RGB', (1024, 1024), (248, 249, 252))
p_arr = np.array(pants_tile, dtype=np.float32)
for leg_center in [256, 768]:
    crease_shadow = -30.0 * np.exp(-((x_grid - leg_center) / 10.0)**2)
    crease_highlight = 10.0 * np.exp(-((x_grid - (leg_center - 7)) / 5.0)**2)
    for c in range(3):
        p_arr[:, :, c] += crease_shadow + crease_highlight
pants_tile = Image.fromarray(np.clip(p_arr, 0, 255).astype(np.uint8))
draw_pants = ImageDraw.Draw(pants_tile)
for leg_center in [256, 768]:
    draw_pants.line([(leg_center - 130, 520), (leg_center + 130, 520)], fill=(228, 229, 234), width=3)
    draw_pants.line([(leg_center - 110, 540), (leg_center + 110, 540)], fill=(230, 231, 236), width=2)
draw_pants.line([(0, 980), (1024, 980)], fill=(220, 221, 225), width=3)
atlas.paste(pants_tile, (0, 1024))


# ─── QUADRANT 4: BOTTOM-RIGHT (1024..2048, 1024..2048) -> SHOES, HANDS, CUFFS ─
# V: 0.5 = top, V: 1.0 = bottom
quad4_tile = Image.new('RGB', (1024, 1024), (22, 22, 28))
draw_q4 = ImageDraw.Draw(quad4_tile)
# Hands area: (0..512, 0..512)
draw_q4.rectangle([(0, 0), (512, 512)], fill=(200, 148, 108))
for ky in range(110, 410, 48):
    draw_q4.line([(50, ky), (460, ky)], fill=(170, 120, 84), width=3)
# White Socks & Cuffs: (0..512, 512..1024)
draw_q4.rectangle([(0, 512), (512, 1024)], fill=(252, 252, 254))
draw_q4.ellipse((115, 595, 165, 645), fill=(250, 200, 50), outline=(255, 235, 95), width=2)
draw_q4.ellipse((355, 595, 405, 645), fill=(250, 200, 50), outline=(255, 235, 95), width=2)
# Glossy Black Oxford Shoes: (512..1024, 0..1024)
draw_q4.rectangle([(512, 0), (1024, 1024)], fill=(14, 14, 18))
draw_q4.ellipse((580, 160, 960, 480), fill=(38, 38, 48))
draw_q4.ellipse((640, 220, 900, 420), fill=(56, 56, 70))
draw_q4.ellipse((700, 260, 840, 370), fill=(84, 84, 102))
draw_q4.line([(560, 460), (980, 460)], fill=(26, 26, 35), width=4)
draw_q4.rectangle([(512, 860), (1024, 1024)], fill=(10, 10, 12))
atlas.paste(quad4_tile, (1024, 1024))

atlas_path = 'public/textures/ravi/ravi_character_atlas.jpg'
atlas.save(atlas_path, quality=95)
print(f'Master Texture Atlas saved: {atlas_path}')


# ══════════════════════════════════════════════════════════════════════════════
# 2. 3D PROCEDURAL MESH HELPERS WITH PRECISE FRONT-CENTER UV ALIGNMENT
# ══════════════════════════════════════════════════════════════════════════════

def compute_smooth_vertex_normals(vertices, faces):
    v0 = vertices[faces[:, 0]]
    v1 = vertices[faces[:, 1]]
    v2 = vertices[faces[:, 2]]
    e1 = v1 - v0
    e2 = v2 - v0
    face_normals = np.cross(e1, e2)
    fn_len = np.linalg.norm(face_normals, axis=1, keepdims=True) + 1e-8
    face_normals = face_normals / fn_len
    
    vertex_normals = np.zeros_like(vertices, dtype=np.float32)
    for i in range(3):
        np.add.at(vertex_normals, faces[:, i], face_normals)
        
    vn_len = np.linalg.norm(vertex_normals, axis=1, keepdims=True) + 1e-8
    vertex_normals = vertex_normals / vn_len
    return vertex_normals

def create_smooth_tube_mesh(rings_data, uv_rect, segments=32, cap_top=False, cap_bottom=False, invert_v=True):
    """
    Creates a cylinder/tube where s=0 (+Z, Front) is at u_frac = 0.5 (center of texture tile!).
    invert_v=True maps ring 0 (bottom) to v1 and ring N (top) to v0, matching image coordinates with flipY=false.
    """
    u0, v0, u1, v1 = uv_rect
    num_rings = len(rings_data)
    verts = []
    uvs = []
    faces = []

    for r_idx, (x, y, z, rx, rz) in enumerate(rings_data):
        v_frac = r_idx / float(num_rings - 1) if num_rings > 1 else 0.5
        if invert_v:
            v_coord = v1 - v_frac * (v1 - v0) # Ring 0 -> v1 (bottom), Ring N -> v0 (top)
        else:
            v_coord = v0 + v_frac * (v1 - v0)
        
        for s in range(segments):
            angle = s / float(segments) * 2.0 * np.pi
            px = x + np.sin(angle) * rx
            py = y
            pz = z + np.cos(angle) * rz
            verts.append([px, py, pz])
            
            # Map s=0 (front +Z) to center of tile (u_frac = 0.5)
            u_frac = ((s / float(segments)) + 0.5) % 1.0
            u_coord = u0 + u_frac * (u1 - u0)
            uvs.append([u_coord, v_coord])

    # CCW Quad faces so normals point strictly outward (+Z front)
    for r in range(num_rings - 1):
        for s in range(segments):
            s_next = (s + 1) % segments
            i0 = r * segments + s
            i1 = r * segments + s_next
            i2 = (r + 1) * segments + s_next
            i3 = (r + 1) * segments + s
            faces.append([i0, i1, i2])
            faces.append([i0, i2, i3])

    if cap_bottom and len(rings_data) > 0:
        center_idx = len(verts)
        bx, by, bz, _, _ = rings_data[0]
        verts.append([bx, by, bz])
        uvs.append([u0 + (u1 - u0) * 0.5, v1 if invert_v else v0])
        for s in range(segments):
            s_next = (s + 1) % segments
            faces.append([center_idx, s, s_next])

    if cap_top and len(rings_data) > 0:
        center_idx = len(verts)
        tx, ty, tz, _, _ = rings_data[-1]
        verts.append([tx, ty, tz])
        uvs.append([u0 + (u1 - u0) * 0.5, v0 if invert_v else v1])
        top_offset = (num_rings - 1) * segments
        for s in range(segments):
            s_next = (s + 1) % segments
            faces.append([center_idx, top_offset + s_next, top_offset + s])

    mesh = trimesh.Trimesh(vertices=np.array(verts, dtype=np.float32), faces=np.array(faces, dtype=np.int32))
    return mesh, np.array(uvs, dtype=np.float32)

def create_sculpted_box_mesh(extents, center, uv_rect):
    u0, v0, u1, v1 = uv_rect
    b = trimesh.creation.box(extents=extents)
    b.apply_translation(center)
    
    uvs = np.zeros((len(b.vertices), 2), dtype=np.float32)
    for i, v in enumerate(b.vertices):
        nx = (v[0] - center[0]) / extents[0] + 0.5
        ny = (v[1] - center[1]) / extents[1] + 0.5
        uvs[i, 0] = u0 + np.clip(nx, 0.0, 1.0) * (u1 - u0)
        uvs[i, 1] = v0 + (1.0 - np.clip(ny, 0.0, 1.0)) * (v1 - v0)
        
    return b, uvs

def create_sculpted_sphere_mesh(radius, center, uv_rect, subdivisions=3):
    u0, v0, u1, v1 = uv_rect
    s = trimesh.creation.icosphere(subdivisions=subdivisions, radius=radius)
    s.apply_translation(center)
    
    uvs = np.zeros((len(s.vertices), 2), dtype=np.float32)
    for i, v in enumerate(s.vertices):
        dx = v[0] - center[0]
        dy = v[1] - center[1]
        dz = v[2] - center[2]
        angle_h = np.arctan2(dx, dz)
        angle_v = np.arcsin(np.clip(dy / radius, -1.0, 1.0))
        u_norm = (angle_h + np.pi) / (2.0 * np.pi)
        v_norm = (np.pi / 2.0 - angle_v) / np.pi # Top to bottom
        uvs[i, 0] = u0 + u_norm * (u1 - u0)
        uvs[i, 1] = v0 + v_norm * (v1 - v0)
        
    return s, uvs


# ══════════════════════════════════════════════════════════════════════════════
# 3. ASSEMBLE REALISTIC RAVI KISHAN HUMAN BODY PARTS
# ══════════════════════════════════════════════════════════════════════════════

part_meshes = []
part_uvs = []

# ─── A. HEAD & FACIAL ANATOMY (Atlas Q1: U 0.0..0.5, V 0.0..0.5) ─────────────
head_rings = [
    [0.0, 1.40, -0.01, 0.070, 0.075], # Neck base
    [0.0, 1.45, -0.01, 0.065, 0.070], # Mid neck
    [0.0, 1.49,  0.00, 0.072, 0.075], # Under jaw
    [0.0, 1.52,  0.02, 0.095, 0.095], # Chin & Jaw
    [0.0, 1.56,  0.02, 0.115, 0.118], # Mouth & Lips
    [0.0, 1.60,  0.02, 0.128, 0.130], # Mustache & Nose base
    [0.0, 1.64,  0.01, 0.132, 0.132], # Cheeks & Eye sockets
    [0.0, 1.68, -0.01, 0.130, 0.130], # Forehead
    [0.0, 1.73, -0.02, 0.125, 0.125], # Temples
    [0.0, 1.77, -0.03, 0.110, 0.112], # Crown
    [0.0, 1.80, -0.03, 0.075, 0.080], # Top skull
    [0.0, 1.82, -0.03, 0.020, 0.020]  # Skull apex
]
head_mesh, head_uv = create_smooth_tube_mesh(head_rings, (0.0, 0.0, 0.5, 0.5), segments=36, cap_top=True, invert_v=True)
part_meshes.append(head_mesh)
part_uvs.append(head_uv)

# 3D Nose Bridge & Tip
nose_bridge, nb_uv = create_sculpted_box_mesh([0.032, 0.065, 0.040], [0.0, 1.61, 0.145], (0.20, 0.15, 0.30, 0.35))
nose_tip, nt_uv = create_sculpted_sphere_mesh(0.018, [0.0, 1.585, 0.160], (0.22, 0.18, 0.28, 0.30), subdivisions=2)
part_meshes.extend([nose_bridge, nose_tip])
part_uvs.extend([nb_uv, nt_uv])

# 3D Ears
ear_l, el_uv = create_sculpted_box_mesh([0.022, 0.065, 0.040], [-0.138, 1.63, -0.01], (0.15, 0.15, 0.25, 0.30))
ear_r, er_uv = create_sculpted_box_mesh([0.022, 0.065, 0.040], [ 0.138, 1.63, -0.01], (0.15, 0.15, 0.25, 0.30))
part_meshes.extend([ear_l, ear_r])
part_uvs.extend([el_uv, er_uv])

# 3D Pompadour Hair Volume
hair_rings = [
    [0.0, 1.70, -0.03, 0.135, 0.140],
    [0.0, 1.76, -0.01, 0.145, 0.152],
    [0.0, 1.82,  0.01, 0.135, 0.145],
    [0.0, 1.86,  0.02, 0.095, 0.105],
    [0.0, 1.88,  0.02, 0.040, 0.045]
]
hair_mesh, hair_uv = create_smooth_tube_mesh(hair_rings, (0.0, 0.0, 0.5, 0.25), segments=32, cap_top=True, invert_v=True)
quiff_front, qf_uv = create_sculpted_box_mesh([0.22, 0.11, 0.15], [0.0, 1.80, 0.05], (0.05, 0.02, 0.45, 0.20))
quiff_side_l, qsl_uv = create_sculpted_box_mesh([0.06, 0.14, 0.18], [-0.12, 1.72, -0.02], (0.0, 0.05, 0.25, 0.25))
quiff_side_r, qsr_uv = create_sculpted_box_mesh([0.06, 0.14, 0.18], [ 0.12, 1.72, -0.02], (0.0, 0.05, 0.25, 0.25))
part_meshes.extend([hair_mesh, quiff_front, quiff_side_l, quiff_side_r])
part_uvs.extend([hair_uv, qf_uv, qsl_uv, qsr_uv])


# ─── B. TORSO & ROYAL BLUE SUIT (Atlas Q2: U 0.5..1.0, V 0.0..0.5) ───────────
torso_rings = [
    [0.0, 0.76, 0.00, 0.225, 0.145], # Jacket lower hem
    [0.0, 0.88, 0.00, 0.210, 0.135], # Waist
    [0.0, 0.98, 0.00, 0.190, 0.125], # Cinch
    [0.0, 1.10, 0.00, 0.215, 0.140], # Ribs
    [0.0, 1.22, 0.00, 0.245, 0.155], # Pectoral chest
    [0.0, 1.34, 0.00, 0.248, 0.150], # Shoulders
    [0.0, 1.40, 0.00, 0.140, 0.105], # Trapezius
    [0.0, 1.42, 0.00, 0.085, 0.085]  # Collar seam
]
torso_mesh, torso_uv = create_smooth_tube_mesh(torso_rings, (0.5, 0.0, 1.0, 0.5), segments=36, cap_bottom=True, cap_top=True, invert_v=True)
part_meshes.append(torso_mesh)
part_uvs.append(torso_uv)

# Shoulder Caps (Mapped inside Royal Blue area: U 0.6..0.9, V 0.1..0.4)
shoulder_l, sl_uv = create_sculpted_sphere_mesh(0.088, [-0.235, 1.34, 0.0], (0.60, 0.10, 0.80, 0.40), subdivisions=2)
shoulder_r, sr_uv = create_sculpted_sphere_mesh(0.088, [ 0.235, 1.34, 0.0], (0.70, 0.10, 0.90, 0.40), subdivisions=2)
part_meshes.extend([shoulder_l, shoulder_r])
part_uvs.extend([sl_uv, sr_uv])

# Peaked Lapels
lapel_l, ll_uv = create_sculpted_box_mesh([0.115, 0.380, 0.024], [-0.115, 1.20, 0.152], (0.65, 0.05, 0.75, 0.35))
lapel_r, lr_uv = create_sculpted_box_mesh([0.115, 0.380, 0.024], [ 0.115, 1.20, 0.152], (0.75, 0.05, 0.85, 0.35))
part_meshes.extend([lapel_l, lapel_r])
part_uvs.extend([ll_uv, lr_uv])

# Collar Wings
collar_l, cl_uv = create_sculpted_box_mesh([0.065, 0.095, 0.016], [-0.075, 1.405, 0.100], (0.68, 0.01, 0.74, 0.08))
collar_r, cr_uv = create_sculpted_box_mesh([0.065, 0.095, 0.016], [ 0.075, 1.405, 0.100], (0.76, 0.01, 0.82, 0.08))
part_meshes.extend([collar_l, collar_r])
part_uvs.extend([cl_uv, cr_uv])

# Pocket & Square
pocket_flap, pf_uv = create_sculpted_box_mesh([0.085, 0.018, 0.012], [-0.145, 1.27, 0.150], (0.66, 0.12, 0.72, 0.18))
pocket_square, ps_uv = create_sculpted_box_mesh([0.060, 0.042, 0.010], [-0.145, 1.295, 0.152], (0.66, 0.10, 0.72, 0.16))
part_meshes.extend([pocket_flap, pocket_square])
part_uvs.extend([pf_uv, ps_uv])

# 6 Gold Buttons
for by in [1.00, 1.11, 1.22]:
    btn_l, bl_uv = create_sculpted_sphere_mesh(0.014, [-0.055, by, 0.155], (0.70, 0.20, 0.74, 0.25), subdivisions=2)
    btn_r, br_uv = create_sculpted_sphere_mesh(0.014, [ 0.055, by, 0.155], (0.76, 0.20, 0.80, 0.25), subdivisions=2)
    part_meshes.extend([btn_l, btn_r])
    part_uvs.extend([bl_uv, br_uv])


# ─── C. ARMS & 5-DIGIT HANDS (Atlas Q2 & Q4: U 0.5..1.0) ─────────────────────
l_arm_rings = [
    [-0.24, 1.34, -0.01, 0.076, 0.076],
    [-0.28, 1.22,  0.01, 0.068, 0.068],
    [-0.30, 1.08,  0.04, 0.062, 0.062],
    [-0.29, 0.94,  0.08, 0.056, 0.056],
    [-0.27, 0.82,  0.13, 0.050, 0.050],
    [-0.25, 0.73,  0.17, 0.046, 0.046]
]
l_arm_mesh, l_arm_uv = create_smooth_tube_mesh(l_arm_rings, (0.6, 0.1, 0.9, 0.45), segments=24, invert_v=True)
l_cuff, lc_uv = create_sculpted_box_mesh([0.058, 0.028, 0.058], [-0.25, 0.71, 0.175], (0.50, 0.75, 0.75, 1.0))
part_meshes.extend([l_arm_mesh, l_cuff])
part_uvs.extend([l_arm_uv, lc_uv])

r_arm_rings = [
    [ 0.24, 1.34, -0.01, 0.076, 0.076],
    [ 0.28, 1.22,  0.01, 0.068, 0.068],
    [ 0.30, 1.08,  0.04, 0.062, 0.062],
    [ 0.29, 0.94,  0.08, 0.056, 0.056],
    [ 0.27, 0.82,  0.13, 0.050, 0.050],
    [ 0.25, 0.73,  0.17, 0.046, 0.046]
]
r_arm_mesh, r_arm_uv = create_smooth_tube_mesh(r_arm_rings, (0.6, 0.1, 0.9, 0.45), segments=24, invert_v=True)
r_cuff, rc_uv = create_sculpted_box_mesh([0.058, 0.028, 0.058], [ 0.25, 0.71, 0.175], (0.50, 0.75, 0.75, 1.0))
part_meshes.extend([r_arm_mesh, r_cuff])
part_uvs.extend([r_arm_uv, rc_uv])

def build_5_finger_hand(palm_center, is_left=True):
    h_parts = []
    h_uvs = []
    sign = -1.0 if is_left else 1.0
    cx, cy, cz = palm_center
    
    palm, p_uv = create_sculpted_box_mesh([0.066, 0.075, 0.024], [cx, cy - 0.035, cz + 0.01], (0.50, 0.50, 0.75, 0.75))
    h_parts.append(palm)
    h_uvs.append(p_uv)
    
    # Thumb
    th1, th1_uv = create_sculpted_box_mesh([0.018, 0.030, 0.018], [cx + sign * 0.036, cy - 0.025, cz + 0.018], (0.55, 0.55, 0.70, 0.70))
    th2, th2_uv = create_sculpted_box_mesh([0.015, 0.026, 0.015], [cx + sign * 0.048, cy - 0.045, cz + 0.028], (0.55, 0.55, 0.70, 0.70))
    h_parts.extend([th1, th2])
    h_uvs.extend([th1_uv, th2_uv])
    
    # 4 Fingers
    finger_offsets = [(0.022, 0.065), (0.007, 0.072), (-0.008, 0.068), (-0.023, 0.055)]
    for fx_off, flen in finger_offsets:
        fx = cx + fx_off * sign
        f1, f1_uv = create_sculpted_box_mesh([0.014, flen * 0.45, 0.014], [fx, cy - 0.078, cz + 0.015], (0.55, 0.55, 0.70, 0.70))
        f2, f2_uv = create_sculpted_box_mesh([0.012, flen * 0.35, 0.012], [fx, cy - 0.100, cz + 0.028], (0.55, 0.55, 0.70, 0.70))
        f3, f3_uv = create_sculpted_box_mesh([0.010, flen * 0.25, 0.010], [fx, cy - 0.114, cz + 0.038], (0.55, 0.55, 0.70, 0.70))
        h_parts.extend([f1, f2, f3])
        h_uvs.extend([f1_uv, f2_uv, f3_uv])
        
    return h_parts, h_uvs

l_hand_parts, l_hand_uvs = build_5_finger_hand([-0.25, 0.69, 0.18], is_left=True)
r_hand_parts, r_hand_uvs = build_5_finger_hand([ 0.25, 0.69, 0.18], is_left=False)
part_meshes.extend(l_hand_parts + r_hand_parts)
part_uvs.extend(l_hand_uvs + r_hand_uvs)


# ─── D. TAILORED WHITE TROUSERS (Atlas Q3: U 0.0..0.5, V 0.5..1.0) ───────────
l_leg_rings = [
    [-0.105, 0.78, 0.00, 0.095, 0.095],
    [-0.115, 0.66, 0.01, 0.086, 0.086],
    [-0.122, 0.54, 0.02, 0.078, 0.078],
    [-0.122, 0.44, 0.03, 0.072, 0.072],
    [-0.118, 0.32, 0.01, 0.068, 0.068],
    [-0.112, 0.18, 0.00, 0.062, 0.062],
    [-0.110, 0.07, 0.00, 0.065, 0.065]
]
l_leg_mesh, l_leg_uv = create_smooth_tube_mesh(l_leg_rings, (0.0, 0.5, 0.25, 1.0), segments=24, invert_v=False)
r_leg_rings = [
    [ 0.105, 0.78, 0.00, 0.095, 0.095],
    [ 0.115, 0.66, 0.00, 0.086, 0.086],
    [ 0.122, 0.54,-0.01, 0.078, 0.078],
    [ 0.122, 0.44, 0.00, 0.072, 0.072],
    [ 0.118, 0.32, 0.01, 0.068, 0.068],
    [ 0.112, 0.18, 0.01, 0.062, 0.062],
    [ 0.110, 0.07, 0.01, 0.065, 0.065]
]
r_leg_mesh, r_leg_uv = create_smooth_tube_mesh(r_leg_rings, (0.25, 0.5, 0.50, 1.0), segments=24, invert_v=False)
part_meshes.extend([l_leg_mesh, r_leg_mesh])
part_uvs.extend([l_leg_uv, r_leg_uv])


# ─── E. BLACK OXFORD SHOES & SOCKS (Atlas Q4: U 0.5..1.0, V 0.5..1.0) ────────
def build_oxford_shoe(shoe_center, is_left=True):
    s_parts = []
    s_uvs = []
    cx, cy, cz = shoe_center
    
    sock, sock_uv = create_sculpted_box_mesh([0.075, 0.045, 0.075], [cx, cy + 0.055, cz], (0.50, 0.75, 0.75, 1.0))
    upper, u_uv = create_sculpted_box_mesh([0.115, 0.065, 0.230], [cx, cy + 0.032, cz + 0.035], (0.75, 0.50, 1.00, 1.00))
    toe, t_uv = create_sculpted_sphere_mesh(0.048, [cx, cy + 0.024, cz + 0.125], (0.75, 0.55, 1.00, 0.95), subdivisions=2)
    sole, sol_uv = create_sculpted_box_mesh([0.125, 0.016, 0.250], [cx, cy + 0.008, cz + 0.035], (0.75, 0.85, 1.00, 1.00))
    heel, h_uv = create_sculpted_box_mesh([0.118, 0.020, 0.080], [cx, cy + 0.010, cz - 0.050], (0.75, 0.85, 1.00, 1.00))
    
    s_parts.extend([sock, upper, toe, sole, heel])
    s_uvs.extend([sock_uv, u_uv, t_uv, sol_uv, h_uv])
    return s_parts, s_uvs

l_shoe_parts, l_shoe_uvs = build_oxford_shoe([-0.110, 0.0, 0.02], is_left=True)
r_shoe_parts, r_shoe_uvs = build_oxford_shoe([ 0.110, 0.0, 0.04], is_left=False)
part_meshes.extend(l_shoe_parts + r_shoe_parts)
part_uvs.extend(l_shoe_uvs + r_shoe_uvs)


# ══════════════════════════════════════════════════════════════════════════════
# 4. UNIFY MESH & EXPLICITLY COMPUTE NORMALS & EXPORT GLB
# ══════════════════════════════════════════════════════════════════════════════
total_verts = []
total_faces = []
total_uv_coords = []
v_offset = 0

for m, uv_arr in zip(part_meshes, part_uvs):
    total_verts.append(m.vertices)
    total_faces.append(m.faces + v_offset)
    total_uv_coords.append(uv_arr)
    v_offset += len(m.vertices)

full_vertices = np.vstack(total_verts).astype(np.float32)
full_faces = np.vstack(total_faces).astype(np.int32)
full_uvs = np.vstack(total_uv_coords).astype(np.float32)

# Compute explicit smooth vertex normals
full_normals = compute_smooth_vertex_normals(full_vertices, full_faces)

character_mesh = trimesh.Trimesh(
    vertices=full_vertices,
    faces=full_faces,
    vertex_normals=full_normals
)

diffuse_img = Image.open(atlas_path)
character_mesh.visual = trimesh.visual.TextureVisuals(
    uv=full_uvs,
    image=diffuse_img
)

pbr_mat = trimesh.visual.material.PBRMaterial(
    baseColorTexture=diffuse_img,
    roughnessFactor=0.55,
    metallicFactor=0.08
)
character_mesh.visual.material = pbr_mat

glb_path = 'public/models/ravi_kishan_character.glb'
glb_bytes = character_mesh.export(file_type='glb')
with open(glb_path, 'wb') as f:
    f.write(glb_bytes)

print(f'Master Ravi Kishan Character exported to {glb_path}:')
print(f'  Vertices: {len(character_mesh.vertices)}')
print(f'  Faces: {len(character_mesh.faces)}')
