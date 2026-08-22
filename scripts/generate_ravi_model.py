import trimesh
import numpy as np
import os
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
import trimesh.visual.material

os.makedirs('public/models', exist_ok=True)
os.makedirs('public/textures/ravi', exist_ok=True)

# ─── 1. BUILD HIGH-RESOLUTION 2048x2048 MASTER ATLAS ─────────────────────────
upload_dir = '/Users/aishmishra/.gemini/antigravity-ide/brain/0caad8a7-e387-48fc-a5f1-57bd52d3d600/.user_uploaded/'
img5 = Image.open(os.path.join(upload_dir, 'media_1787315096962.png'))
img2 = Image.open(os.path.join(upload_dir, 'media_1787315085869.png'))

atlas = Image.new('RGB', (2048, 2048), (20, 20, 25))

# Top-Left (0,0 to 1024,1024): 3D Head & Hair (UV: U 0..0.5, V 0.5..1.0)
head_tex = Image.new('RGB', (1024, 1024), (194, 144, 104))
arr_h = np.array(head_tex, dtype=np.float32)
y_i, x_i = np.indices((1024, 1024))
arr_h += np.random.normal(0, 3.0, (1024, 1024, 3))
# Hair mask (top and back)
hair_mask = (y_i < 380) | (x_i < 220) | (x_i > 804)
arr_h[hair_mask] = [16, 9, 4]
head_tex = Image.fromarray(np.clip(arr_h, 0, 255).astype(np.uint8))

face_crop = img5.crop((165, 12, 305, 160)).resize((520, 560), Image.Resampling.LANCZOS)
face_crop = ImageEnhance.Sharpness(face_crop).enhance(2.4)
face_crop = ImageEnhance.Contrast(face_crop).enhance(1.25)
face_mask = Image.new('L', (520, 560), 0)
ImageDraw.Draw(face_mask).ellipse((25, 15, 495, 545), fill=255)
face_mask = face_mask.filter(ImageFilter.GaussianBlur(radius=28))
head_tex.paste(face_crop, (252, 230), face_mask)
atlas.paste(head_tex, (0, 0))

# Top-Right (1024,0 to 2048,1024): Royal Blue Double-Breasted Suit (UV: U 0.5..1.0, V 0.5..1.0)
suit_tex = Image.new('RGB', (1024, 1024), (29, 78, 216))
draw_s = ImageDraw.Draw(suit_tex)
# White shirt V-neck & popped collar
draw_s.polygon([(256, 390), (175, 30), (337, 30)], fill=(255, 255, 255))
draw_s.polygon([(175, 30), (120, 5), (205, 85)], fill=(252, 252, 252))
draw_s.polygon([(337, 30), (392, 5), (307, 85)], fill=(252, 252, 252))
# Peaked lapels
draw_s.polygon([(135, 50), (256, 430), (185, 430), (105, 155), (85, 135), (145, 95)], fill=(20, 52, 155))
draw_s.polygon([(377, 50), (256, 430), (327, 430), (407, 155), (427, 135), (367, 95)], fill=(20, 52, 155))
# Pocket square
draw_s.rectangle([(95, 305), (170, 320)], fill=(18, 42, 125))
draw_s.polygon([(105, 305), (132, 260), (160, 305)], fill=(255, 255, 255))
for px in range(112, 155, 7):
    draw_s.ellipse((px - 2, 278, px + 2, 282), fill=(29, 78, 216))
# 6 Gold buttons (2 columns of 3)
for by in [470, 575, 680]:
    draw_s.ellipse((184, by - 18, 222, by + 18), fill=(245, 192, 48), outline=(255, 225, 75), width=3)
    draw_s.ellipse((195, by - 8, 211, by + 8), fill=(255, 235, 100))
    draw_s.ellipse((290, by - 18, 328, by + 18), fill=(245, 192, 48), outline=(255, 225, 75), width=3)
    draw_s.ellipse((301, by - 8, 317, by + 8), fill=(255, 235, 100))
# Flap pockets
draw_s.rectangle([(75, 630), (175, 665)], fill=(20, 52, 155), outline=(14, 36, 105), width=2)
draw_s.rectangle([(337, 630), (437, 665)], fill=(20, 52, 155), outline=(14, 36, 105), width=2)
# Back seams
draw_s.line([(768, 30), (768, 990)], fill=(14, 36, 105), width=4)
draw_s.line([(630, 110), (630, 920)], fill=(18, 44, 125), width=2)
draw_s.line([(906, 110), (906, 920)], fill=(18, 44, 125), width=2)
atlas.paste(suit_tex, (1024, 0))

# Bottom-Left (0, 1024 to 1024, 2048): White Trousers (UV: U 0.0..0.5, V 0.0..0.5)
pants_tex = Image.new('RGB', (1024, 1024), (245, 246, 248))
arr_p = np.array(pants_tex, dtype=np.float32)
for leg_c in [256, 768]:
    crease = -28.0 * np.exp(-((x_i - leg_c)/12.0)**2)
    for c in range(3):
        arr_p[:, :, c] += crease
pants_tex = Image.fromarray(np.clip(arr_p, 0, 255).astype(np.uint8))
atlas.paste(pants_tex, (0, 1024))

# Bottom-Right (1024, 1024 to 2048, 2048): Black Leather Shoes, Socks, Skin (UV: U 0.5..1.0, V 0.0..0.5)
shoes_tex = Image.new('RGB', (1024, 1024), (10, 10, 14))
draw_sh = ImageDraw.Draw(shoes_tex)
# Skin area (top-left)
draw_sh.rectangle([(0, 0), (512, 512)], fill=(194, 144, 104))
# White socks area (bottom-left)
draw_sh.rectangle([(0, 512), (512, 1024)], fill=(250, 250, 250))
# Black glossy leather shoes with specular shine (right half)
draw_sh.rectangle([(512, 0), (1024, 1024)], fill=(12, 12, 16))
draw_sh.ellipse((580, 180, 960, 480), fill=(30, 30, 38))
draw_sh.ellipse((640, 240, 900, 420), fill=(42, 42, 52))
atlas.paste(shoes_tex, (1024, 1024))

atlas_path = 'public/textures/ravi/ravi_character_atlas.jpg'
atlas.save(atlas_path, quality=95)

# ─── 2. BUILD SMOOTH ORGANIC MESHES ──────────────────────────────────────────
all_meshes = []

def create_smooth_tube(points, radii, uv_rect, segments=24):
    all_verts = []
    all_uvs = []
    all_faces = []
    u0, v0, u1, v1 = uv_rect

    num_rings = len(points)
    for ring_idx, (pt, r) in enumerate(zip(points, radii)):
        pt = np.array(pt, dtype=np.float32)
        v_frac = ring_idx / float(num_rings - 1)
        if ring_idx < num_rings - 1:
            tangent = np.array(points[ring_idx + 1]) - pt
        else:
            tangent = pt - np.array(points[ring_idx - 1])
        tangent = tangent / (np.linalg.norm(tangent) + 1e-6)

        arbitrary = np.array([0, 1, 0] if abs(tangent[1]) < 0.9 else [1, 0, 0], dtype=np.float32)
        normal = np.cross(tangent, arbitrary)
        normal /= np.linalg.norm(normal)
        binormal = np.cross(tangent, normal)

        for s in range(segments):
            angle = s / float(segments) * 2.0 * np.pi
            offset = (np.cos(angle) * normal + np.sin(angle) * binormal) * r
            v_pos = pt + offset
            all_verts.append(v_pos)

            u_frac = s / float(segments)
            all_uvs.append([u0 + u_frac * (u1 - u0), v0 + v_frac * (v1 - v0)])

    for r in range(num_rings - 1):
        for s in range(segments):
            s_next = (s + 1) % segments
            i0 = r * segments + s
            i1 = r * segments + s_next
            i2 = (r + 1) * segments + s_next
            i3 = (r + 1) * segments + s
            all_faces.append([i0, i1, i2])
            all_faces.append([i0, i2, i3])

    mesh = trimesh.Trimesh(vertices=all_verts, faces=all_faces)
    return mesh, all_uvs

def create_smooth_sphere(radius, center, uv_rect, subdivisions=3):
    s = trimesh.creation.icosphere(subdivisions=subdivisions, radius=radius)
    s.apply_translation(center)
    u0, v0, u1, v1 = uv_rect
    uvs = np.zeros((len(s.vertices), 2), dtype=np.float32)
    for i, v in enumerate(s.vertices):
        dx = v[0] - center[0]
        dy = v[1] - center[1]
        dz = v[2] - center[2]
        angle_h = np.arctan2(dx, dz)
        angle_v = np.arcsin(np.clip(dy / radius, -1.0, 1.0))
        u_norm = (angle_h + np.pi) / (2.0 * np.pi)
        v_norm = (angle_v + np.pi / 2.0) / np.pi
        uvs[i, 0] = u0 + u_norm * (u1 - u0)
        uvs[i, 1] = v0 + v_norm * (v1 - v0)
    return s, uvs

def create_smooth_box(extents, center, uv_rect):
    b = trimesh.creation.box(extents=extents)
    b.apply_translation(center)
    u0, v0, u1, v1 = uv_rect
    uvs = np.zeros((len(b.vertices), 2), dtype=np.float32)
    for i, v in enumerate(b.vertices):
        nx = (v[0] - center[0]) / extents[0] + 0.5
        ny = (v[1] - center[1]) / extents[1] + 0.5
        uvs[i, 0] = u0 + nx * (u1 - u0)
        uvs[i, 1] = v0 + ny * (v1 - v0)
    return b, uvs

# ─── A. 3D HEAD & SCULPTED FEATURES (FACING +Z) ──────────────────────────────
# UV in Atlas: U: 0.0 to 0.5, V: 0.5 to 1.0
head_pts = [
    [0, 1.44, -0.01],  # Neck base
    [0, 1.50, 0.01],   # Chin & jaw
    [0, 1.58, 0.01],   # Cheeks & nose
    [0, 1.66, -0.01],  # Eyes & forehead
    [0, 1.76, -0.02],  # Crown
    [0, 1.80, 0.0]     # Top hair
]
head_radii = [0.078, 0.130, 0.158, 0.158, 0.140, 0.05]
head_mesh, head_uvs = create_smooth_tube(head_pts, head_radii, (0.0, 0.5, 0.5, 1.0), segments=28)

# 3D Nose Bridge & Quiff Hair
nose_mesh, nose_uvs = create_smooth_box([0.034, 0.072, 0.045], [0, 1.58, 0.165], (0.2, 0.6, 0.3, 0.8))
quiff1, q1_uvs = create_smooth_box([0.26, 0.11, 0.18], [0.02, 1.76, 0.05], (0.0, 0.8, 0.2, 1.0))
quiff2, q2_uvs = create_smooth_box([0.17, 0.09, 0.14], [-0.05, 1.74, 0.04], (0.0, 0.8, 0.2, 1.0))
ear_l, el_uvs = create_smooth_sphere(0.044, [-0.165, 1.58, 0.0], (0.2, 0.5, 0.3, 0.6))
ear_r, er_uvs = create_smooth_sphere(0.044, [0.165, 1.58, 0.0], (0.2, 0.5, 0.3, 0.6))

# ─── B. TORSO & ROYAL BLUE DOUBLE-BREASTED SUIT (FACING +Z) ──────────────────
# UV in Atlas: U: 0.5 to 1.0, V: 0.5 to 1.0
torso_pts = [
    [0, 0.82, 0.0],    # Jacket hem flare
    [0, 0.94, 0.0],    # Waist cinch
    [0, 1.08, -0.01],  # Midriff
    [0, 1.22, -0.01],  # Chest
    [0, 1.34, -0.01],  # Shoulders
    [0, 1.42, 0.0]     # Neck base
]
torso_radii = [0.22, 0.19, 0.21, 0.235, 0.22, 0.09]
torso_mesh, torso_uvs = create_smooth_tube(torso_pts, torso_radii, (0.5, 0.5, 1.0, 1.0), segments=28)

# 3D Peaked Lapels
lapel_l, ll_uvs = create_smooth_box([0.10, 0.34, 0.018], [-0.12, 1.22, 0.145], (0.55, 0.6, 0.75, 0.95))
lapel_r, lr_uvs = create_smooth_box([0.10, 0.34, 0.018], [0.12, 1.22, 0.145], (0.75, 0.6, 0.95, 0.95))
# Popped Collar
collar_l, cl_uvs = create_smooth_box([0.06, 0.11, 0.012], [-0.08, 1.41, 0.105], (0.5, 0.5, 0.75, 0.75))
collar_r, cr_uvs = create_smooth_box([0.06, 0.11, 0.012], [0.08, 1.41, 0.105], (0.5, 0.5, 0.75, 0.75))
# Pocket Square
pocket_sq, ps_uvs = create_smooth_box([0.062, 0.035, 0.010], [-0.145, 1.28, 0.145], (0.55, 0.7, 0.7, 0.85))

# 6 3D Gold Buttons
buttons_mesh = []
buttons_uvs = []
for by in [1.02, 1.13, 1.24]:
    bl, bl_uv = create_smooth_sphere(0.013, [-0.06, by, 0.145], (0.5, 0.0, 0.75, 0.25))
    br, br_uv = create_smooth_sphere(0.013, [0.06, by, 0.145], (0.5, 0.0, 0.75, 0.25))
    buttons_mesh.extend([bl, br])
    buttons_uvs.extend([bl_uv, br_uv])

# ─── C. ARMS & 5-FINGER HANDS (MENACING POSED IN FRONT) ──────────────────────
# Left Arm (Poised at waist / hip)
l_arm_pts = [
    [-0.24, 1.34, -0.01],
    [-0.29, 1.22, 0.02],
    [-0.31, 1.08, 0.05],
    [-0.30, 0.96, 0.09],
    [-0.28, 0.84, 0.14],
    [-0.26, 0.72, 0.18]
]
l_arm_radii = [0.075, 0.066, 0.060, 0.055, 0.050, 0.045]
l_arm_mesh, l_arm_uvs = create_smooth_tube(l_arm_pts, l_arm_radii, (0.5, 0.5, 1.0, 1.0), segments=18)
l_cuff, lc_uvs = create_smooth_box([0.06, 0.03, 0.06], [-0.26, 0.70, 0.19], (0.5, 0.5, 0.75, 0.75))
l_hand, lh_uvs = create_smooth_box([0.065, 0.08, 0.022], [-0.25, 0.64, 0.21], (0.5, 0.75, 0.75, 1.0))

# Right Arm (Raised beckoning horror gesture)
r_arm_pts = [
    [0.24, 1.34, -0.01],
    [0.29, 1.22, 0.02],
    [0.31, 1.08, 0.05],
    [0.30, 0.96, 0.09],
    [0.28, 0.84, 0.14],
    [0.26, 0.72, 0.18]
]
r_arm_radii = [0.075, 0.066, 0.060, 0.055, 0.050, 0.045]
r_arm_mesh, r_arm_uvs = create_smooth_tube(r_arm_pts, r_arm_radii, (0.5, 0.5, 1.0, 1.0), segments=18)
r_cuff, rc_uvs = create_smooth_box([0.06, 0.03, 0.06], [0.26, 0.70, 0.19], (0.5, 0.5, 0.75, 0.75))
r_hand, rh_uvs = create_smooth_box([0.065, 0.08, 0.022], [0.25, 0.64, 0.21], (0.5, 0.75, 0.75, 1.0))

# ─── D. WHITE TROUSERS & LEGS (HORROR SWAGGER POSE) ──────────────────────────
# UV in Atlas: U: 0.0 to 0.5, V: 0.0 to 0.5
# Left Leg (Stepped slightly forward and outward)
l_leg_pts = [
    [-0.11, 0.82, 0.0],
    [-0.12, 0.68, 0.02],
    [-0.13, 0.54, 0.04],
    [-0.13, 0.40, 0.05],
    [-0.12, 0.26, 0.02],
    [-0.11, 0.12, -0.01],
    [-0.11, 0.05, -0.02]
]
l_leg_radii = [0.085, 0.076, 0.070, 0.066, 0.062, 0.056, 0.060]
l_leg_mesh, l_leg_uvs = create_smooth_tube(l_leg_pts, l_leg_radii, (0.0, 0.0, 0.5, 0.5), segments=18)

# Right Leg (Bent outward)
r_leg_pts = [
    [0.11, 0.82, 0.0],
    [0.12, 0.68, -0.01],
    [0.13, 0.54, -0.02],
    [0.13, 0.40, -0.01],
    [0.12, 0.26, 0.01],
    [0.11, 0.12, 0.01],
    [0.11, 0.05, 0.0]
]
r_leg_radii = [0.085, 0.076, 0.070, 0.066, 0.062, 0.056, 0.060]
r_leg_mesh, r_leg_uvs = create_smooth_tube(r_leg_pts, r_leg_radii, (0.0, 0.0, 0.5, 0.5), segments=18)

# ─── E. BLACK FORMAL OXFORD SHOES & SOCKS ────────────────────────────────────
# UV in Atlas: U: 0.5 to 1.0, V: 0.0 to 0.5
l_sock, ls_uvs = create_smooth_box([0.07, 0.05, 0.07], [-0.11, 0.06, -0.01], (0.5, 0.0, 0.75, 0.25))
l_shoe, lsh_uvs = create_smooth_box([0.115, 0.070, 0.23], [-0.11, 0.038, 0.04], (0.75, 0.0, 1.0, 0.5))
l_sole, lso_uvs = create_smooth_box([0.120, 0.015, 0.24], [-0.11, 0.008, 0.04], (0.75, 0.0, 1.0, 0.5))

r_sock, rs_uvs = create_smooth_box([0.07, 0.05, 0.07], [0.11, 0.06, 0.01], (0.5, 0.0, 0.75, 0.25))
r_shoe, rsh_uvs = create_smooth_box([0.115, 0.070, 0.23], [0.11, 0.038, 0.06], (0.75, 0.0, 1.0, 0.5))
r_sole, rso_uvs = create_smooth_box([0.120, 0.015, 0.24], [0.11, 0.008, 0.06], (0.75, 0.0, 1.0, 0.5))

# Combine all parts with their UV arrays
part_meshes = [
    head_mesh, nose_mesh, quiff1, quiff2, ear_l, ear_r,
    torso_mesh, lapel_l, lapel_r, collar_l, collar_r, pocket_sq, *buttons_mesh,
    l_arm_mesh, l_cuff, l_hand,
    r_arm_mesh, r_cuff, r_hand,
    l_leg_mesh, r_leg_mesh,
    l_sock, l_shoe, l_sole,
    r_sock, r_shoe, r_sole
]

part_uv_lists = [
    head_uvs, nose_uvs, q1_uvs, q2_uvs, el_uvs, er_uvs,
    torso_uvs, ll_uvs, lr_uvs, cl_uvs, cr_uvs, ps_uvs, *buttons_uvs,
    l_arm_uvs, lc_uvs, lh_uvs,
    r_arm_uvs, rc_uvs, rh_uvs,
    l_leg_uvs, r_leg_uvs,
    ls_uvs, lsh_uvs, lso_uvs,
    rs_uvs, rsh_uvs, rso_uvs
]

# Assemble single continuous indexed mesh
total_vertices = []
total_faces = []
total_uvs = []
v_offset = 0

for m, uv_arr in zip(part_meshes, part_uv_lists):
    total_vertices.append(m.vertices)
    total_faces.append(m.faces + v_offset)
    total_uvs.append(uv_arr)
    v_offset += len(m.vertices)

full_vertices = np.vstack(total_vertices)
full_faces = np.vstack(total_faces)
full_uvs = np.vstack(total_uvs)

final_character = trimesh.Trimesh(vertices=full_vertices, faces=full_faces)
final_character.visual = trimesh.visual.TextureVisuals(uv=full_uvs, image=atlas)

# Configure PBR material so GLTF embeds the atlas texture
mat = trimesh.visual.material.PBRMaterial(
    baseColorTexture=atlas,
    roughnessFactor=0.6,
    metallicFactor=0.1
)
final_character.visual.material = mat

glb_path = 'public/models/ravi_kishan_character.glb'
final_character.export(glb_path)
print(f'Successfully sculpted and exported realistic horror character: {glb_path} ({len(final_character.vertices)} vertices, {len(final_character.faces)} faces)')
