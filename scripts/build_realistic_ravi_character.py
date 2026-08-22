import os
import trimesh
import numpy as np
from PIL import Image
import trimesh.visual.material

os.makedirs('public/models', exist_ok=True)
os.makedirs('public/textures/ravi', exist_ok=True)

# ══════════════════════════════════════════════════════════════════════════════
# PROCEDURAL MESH GENERATION HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def create_smooth_tube_mesh(rings_data, uv_rect, segments=32, cap_top=False, cap_bottom=False):
    """
    Creates a high-density, smooth organic tubular mesh from a list of (x, y, z, rx, rz) rings.
    uv_rect: (u0, v0, u1, v1) mapping the vertical length of the tube across UV coordinates.
    """
    u0, v0, u1, v1 = uv_rect
    num_rings = len(rings_data)
    verts = []
    uvs = []
    faces = []

    for r_idx, (x, y, z, rx, rz) in enumerate(rings_data):
        v_frac = r_idx / float(num_rings - 1) if num_rings > 1 else 0.5
        v_coord = v0 + v_frac * (v1 - v0)
        
        for s in range(segments):
            angle = s / float(segments) * 2.0 * np.pi
            px = x + np.sin(angle) * rx
            py = y
            pz = z + np.cos(angle) * rz
            verts.append([px, py, pz])
            
            u_frac = s / float(segments)
            u_coord = u0 + u_frac * (u1 - u0)
            uvs.append([u_coord, v_coord])

    # Build Quad faces
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
        uvs.append([u0 + (u1 - u0) * 0.5, v0])
        for s in range(segments):
            s_next = (s + 1) % segments
            faces.append([center_idx, s_next, s])

    if cap_top and len(rings_data) > 0:
        center_idx = len(verts)
        tx, ty, tz, _, _ = rings_data[-1]
        verts.append([tx, ty, tz])
        uvs.append([u0 + (u1 - u0) * 0.5, v1])
        top_offset = (num_rings - 1) * segments
        for s in range(segments):
            s_next = (s + 1) % segments
            faces.append([center_idx, top_offset + s, top_offset + s_next])

    mesh = trimesh.Trimesh(vertices=np.array(verts, dtype=np.float32), faces=np.array(faces, dtype=np.int32))
    return mesh, np.array(uvs, dtype=np.float32)

def create_sculpted_box_mesh(extents, center, uv_rect, subdivisions=1):
    """
    Creates a box mesh with smoothed vertices and specified UV bounds.
    """
    u0, v0, u1, v1 = uv_rect
    b = trimesh.creation.box(extents=extents)
    b.apply_translation(center)
    
    uvs = np.zeros((len(b.vertices), 2), dtype=np.float32)
    for i, v in enumerate(b.vertices):
        nx = (v[0] - center[0]) / extents[0] + 0.5
        ny = (v[1] - center[1]) / extents[1] + 0.5
        uvs[i, 0] = u0 + np.clip(nx, 0.0, 1.0) * (u1 - u0)
        uvs[i, 1] = v0 + np.clip(ny, 0.0, 1.0) * (v1 - v0)
        
    return b, uvs

def create_sculpted_sphere_mesh(radius, center, uv_rect, subdivisions=3):
    """
    Creates an icosphere mesh with spherical UV mapping.
    """
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
        v_norm = (angle_v + np.pi / 2.0) / np.pi
        uvs[i, 0] = u0 + u_norm * (u1 - u0)
        uvs[i, 1] = v0 + v_norm * (v1 - v0)
        
    return s, uvs


# ══════════════════════════════════════════════════════════════════════════════
# 1. ANATOMICALLY DETAILED HEAD & FACIAL FEATURES
# Atlas UV Quadrant 1: U [0.0, 0.5], V [0.5, 1.0]
# ══════════════════════════════════════════════════════════════════════════════
head_meshes = []
head_uv_list = []

# Sculpted Head & Neck Ring Profile (32 radial segments for ultra-smooth silhouette)
# Rings data: (x, y, z, rx, rz)
head_rings = [
    [0.0, 1.40, -0.01, 0.070, 0.075], # Base of neck / clavicle junction
    [0.0, 1.45, -0.01, 0.065, 0.070], # Mid-neck with Adam's apple
    [0.0, 1.49,  0.00, 0.072, 0.075], # Upper neck under jaw
    [0.0, 1.52,  0.02, 0.095, 0.095], # Chin & Mandible angle
    [0.0, 1.56,  0.02, 0.115, 0.118], # Lower lip & Mouth corners
    [0.0, 1.60,  0.02, 0.128, 0.130], # Upper lip, Mustache & Nose base
    [0.0, 1.64,  0.01, 0.132, 0.132], # Cheekbones & Eye socket centers
    [0.0, 1.68, -0.01, 0.130, 0.130], # Brow ridge & Lower forehead
    [0.0, 1.73, -0.02, 0.125, 0.125], # Upper forehead & Temples
    [0.0, 1.77, -0.03, 0.110, 0.112], # Crown of skull
    [0.0, 1.80, -0.03, 0.075, 0.080], # Top skull
    [0.0, 1.82, -0.03, 0.020, 0.020]  # Skull apex
]
head_base_mesh, head_base_uv = create_smooth_tube_mesh(
    head_rings, (0.0, 0.5, 0.5, 1.0), segments=36, cap_bottom=False, cap_top=True
)
head_meshes.append(head_base_mesh)
head_uv_list.append(head_base_uv)

# Sculpted 3D Nose Bridge & Tip (Facing +Z)
nose_m1, n_uv1 = create_sculpted_box_mesh([0.032, 0.065, 0.040], [0.0, 1.61, 0.145], (0.20, 0.65, 0.30, 0.85))
nose_tip, n_uv2 = create_sculpted_sphere_mesh(0.018, [0.0, 1.585, 0.160], (0.22, 0.68, 0.28, 0.80), subdivisions=2)
head_meshes.extend([nose_m1, nose_tip])
head_uv_list.extend([n_uv1, n_uv2])

# Sculpted 3D Ears on Left and Right
ear_l, el_uv = create_sculpted_box_mesh([0.022, 0.065, 0.040], [-0.138, 1.63, -0.01], (0.15, 0.55, 0.25, 0.70))
ear_r, er_uv = create_sculpted_box_mesh([0.022, 0.065, 0.040], [ 0.138, 1.63, -0.01], (0.15, 0.55, 0.25, 0.70))
head_meshes.extend([ear_l, ear_r])
head_uv_list.extend([el_uv, er_uv])

# High-Volume Sculpted 3D Pompadour Hair (Layered geometry matching Ravi Kishan's signature style)
hair_rings = [
    [0.0, 1.70, -0.03, 0.135, 0.140], # Hairline base around crown
    [0.0, 1.76, -0.01, 0.145, 0.152], # Hair bulge & quiff volume
    [0.0, 1.82,  0.01, 0.135, 0.145], # Upper pompadour crest
    [0.0, 1.86,  0.02, 0.095, 0.105], # Swept-up quiff top
    [0.0, 1.88,  0.02, 0.040, 0.045]  # Hair crest tip
]
hair_mesh, hair_uv = create_smooth_tube_mesh(
    hair_rings, (0.0, 0.75, 0.5, 1.0), segments=32, cap_top=True
)
# Front swept-back quiff volume
quiff_front, qf_uv = create_sculpted_box_mesh([0.22, 0.11, 0.15], [0.0, 1.80, 0.05], (0.05, 0.80, 0.45, 0.98))
quiff_side_l, qsl_uv = create_sculpted_box_mesh([0.06, 0.14, 0.18], [-0.12, 1.72, -0.02], (0.0, 0.75, 0.25, 0.95))
quiff_side_r, qsr_uv = create_sculpted_box_mesh([0.06, 0.14, 0.18], [ 0.12, 1.72, -0.02], (0.0, 0.75, 0.25, 0.95))

head_meshes.extend([hair_mesh, quiff_front, quiff_side_l, quiff_side_r])
head_uv_list.extend([hair_uv, qf_uv, qsl_uv, qsr_uv])


# ══════════════════════════════════════════════════════════════════════════════
# 2. ROYAL BLUE DOUBLE-BREASTED SUIT JACKET & CHEST
# Atlas UV Quadrant 2: U [0.5, 1.0], V [0.5, 1.0]
# ══════════════════════════════════════════════════════════════════════════════
torso_meshes = []
torso_uv_list = []

# Sculpted Torso & Suit Jacket Contour (Wide shoulders, tapered waist, flared hem)
torso_rings = [
    [0.0, 0.76, 0.00, 0.225, 0.145], # Jacket lower hem (mid-thigh flare)
    [0.0, 0.88, 0.00, 0.210, 0.135], # Lower waist & hip line
    [0.0, 0.98, 0.00, 0.190, 0.125], # Tailored waist cinch
    [0.0, 1.10, 0.00, 0.215, 0.140], # Mid-torso & ribs
    [0.0, 1.22, 0.00, 0.245, 0.155], # Full Pectoral Chest
    [0.0, 1.34, 0.00, 0.248, 0.150], # Broad Shoulder shelf
    [0.0, 1.40, 0.00, 0.140, 0.105], # Upper Trapezius slope
    [0.0, 1.42, 0.00, 0.085, 0.085]  # Neck collar seam
]
torso_mesh, torso_uv = create_smooth_tube_mesh(
    torso_rings, (0.5, 0.5, 1.0, 1.0), segments=36, cap_bottom=True, cap_top=True
)
torso_meshes.append(torso_mesh)
torso_uv_list.append(torso_uv)

# 3D Shoulder Deltoid Caps (Tailored suit padding)
shoulder_l, sl_uv = create_sculpted_sphere_mesh(0.088, [-0.235, 1.34, 0.0], (0.55, 0.80, 0.75, 0.98), subdivisions=2)
shoulder_r, sr_uv = create_sculpted_sphere_mesh(0.088, [ 0.235, 1.34, 0.0], (0.75, 0.80, 0.95, 0.98), subdivisions=2)
torso_meshes.extend([shoulder_l, shoulder_r])
torso_uv_list.extend([sl_uv, sr_uv])

# 3D Peaked Royal Blue Lapels with Beveled Edge
lapel_l, ll_uv = create_sculpted_box_mesh([0.115, 0.380, 0.024], [-0.115, 1.20, 0.152], (0.55, 0.60, 0.75, 0.95))
lapel_r, lr_uv = create_sculpted_box_mesh([0.115, 0.380, 0.024], [ 0.115, 1.20, 0.152], (0.75, 0.60, 0.95, 0.95))
torso_meshes.extend([lapel_l, lapel_r])
torso_uv_list.extend([ll_uv, lr_uv])

# 3D Crisp White Shirt Collar Wings peeking above jacket
collar_l, cl_uv = create_sculpted_box_mesh([0.065, 0.095, 0.016], [-0.075, 1.405, 0.100], (0.55, 0.50, 0.70, 0.65))
collar_r, cr_uv = create_sculpted_box_mesh([0.065, 0.095, 0.016], [ 0.075, 1.405, 0.100], (0.55, 0.50, 0.70, 0.65))
torso_meshes.extend([collar_l, collar_r])
torso_uv_list.extend([cl_uv, cr_uv])

# Left Breast Pocket & White Pocket Square
pocket_flap, pf_uv = create_sculpted_box_mesh([0.085, 0.018, 0.012], [-0.145, 1.27, 0.150], (0.55, 0.70, 0.70, 0.85))
pocket_square, ps_uv = create_sculpted_box_mesh([0.060, 0.042, 0.010], [-0.145, 1.295, 0.152], (0.55, 0.70, 0.70, 0.85))
torso_meshes.extend([pocket_flap, pocket_square])
torso_uv_list.extend([pf_uv, ps_uv])

# 6 3D Embossed Metallic Gold Buttons (2 columns of 3)
button_meshes = []
button_uvs = []
for by in [1.00, 1.11, 1.22]:
    btn_l, bl_uv = create_sculpted_sphere_mesh(0.014, [-0.055, by, 0.155], (0.55, 0.0, 0.75, 0.25), subdivisions=2)
    btn_r, br_uv = create_sculpted_sphere_mesh(0.014, [ 0.055, by, 0.155], (0.55, 0.0, 0.75, 0.25), subdivisions=2)
    button_meshes.extend([btn_l, btn_r])
    button_uvs.extend([bl_uv, br_uv])
torso_meshes.extend(button_meshes)
torso_uv_list.extend(button_uvs)


# ══════════════════════════════════════════════════════════════════════════════
# 3. ARMS, CUFFS & ARTICULATED 5-FINGER HANDS
# Atlas UV Quadrant 4: U [0.5, 1.0], V [0.0, 0.5] & Suit UV
# ══════════════════════════════════════════════════════════════════════════════
arm_meshes = []
arm_uv_list = []

# Left Arm: Royal Blue Sleeve (Poised menacingly at hip)
l_arm_rings = [
    [-0.24, 1.34, -0.01, 0.076, 0.076], # Shoulder armhole
    [-0.28, 1.22,  0.01, 0.068, 0.068], # Upper bicep
    [-0.30, 1.08,  0.04, 0.062, 0.062], # Elbow joint
    [-0.29, 0.94,  0.08, 0.056, 0.056], # Forearm taper
    [-0.27, 0.82,  0.13, 0.050, 0.050], # Lower forearm
    [-0.25, 0.73,  0.17, 0.046, 0.046]  # Sleeve cuff hem
]
l_arm_mesh, l_arm_uv = create_smooth_tube_mesh(l_arm_rings, (0.5, 0.5, 1.0, 1.0), segments=24)
l_cuff, lc_uv = create_sculpted_box_mesh([0.058, 0.028, 0.058], [-0.25, 0.71, 0.175], (0.5, 0.5, 0.75, 0.75))
arm_meshes.extend([l_arm_mesh, l_cuff])
arm_uv_list.extend([l_arm_uv, lc_uv])

# Right Arm: Royal Blue Sleeve (Raised horror beckon gesture)
r_arm_rings = [
    [ 0.24, 1.34, -0.01, 0.076, 0.076],
    [ 0.28, 1.22,  0.01, 0.068, 0.068],
    [ 0.30, 1.08,  0.04, 0.062, 0.062],
    [ 0.29, 0.94,  0.08, 0.056, 0.056],
    [ 0.27, 0.82,  0.13, 0.050, 0.050],
    [ 0.25, 0.73,  0.17, 0.046, 0.046]
]
r_arm_mesh, r_arm_uv = create_smooth_tube_mesh(r_arm_rings, (0.5, 0.5, 1.0, 1.0), segments=24)
r_cuff, rc_uv = create_sculpted_box_mesh([0.058, 0.028, 0.058], [ 0.25, 0.71, 0.175], (0.5, 0.5, 0.75, 0.75))
arm_meshes.extend([r_arm_mesh, r_cuff])
arm_uv_list.extend([r_arm_uv, rc_uv])

def build_5_finger_hand(palm_center, is_left=True):
    """
    Builds a realistic 5-digit hand with palm and jointed fingers in a menacing curled horror pose.
    """
    hand_parts = []
    hand_uvs = []
    sign = -1.0 if is_left else 1.0
    cx, cy, cz = palm_center
    
    # Palm Base
    palm, p_uv = create_sculpted_box_mesh([0.066, 0.075, 0.024], [cx, cy - 0.035, cz + 0.01], (0.50, 0.75, 0.75, 1.0))
    hand_parts.append(palm)
    hand_uvs.append(p_uv)
    
    # Thumb (2 joints, angled outward at 45 degrees)
    th1, th1_uv = create_sculpted_box_mesh([0.018, 0.030, 0.018], [cx + sign * 0.036, cy - 0.025, cz + 0.018], (0.55, 0.80, 0.70, 0.95))
    th2, th2_uv = create_sculpted_box_mesh([0.015, 0.026, 0.015], [cx + sign * 0.048, cy - 0.045, cz + 0.028], (0.55, 0.80, 0.70, 0.95))
    hand_parts.extend([th1, th2])
    hand_uvs.extend([th1_uv, th2_uv])
    
    # 4 Jointed Fingers (Index, Middle, Ring, Pinky)
    finger_offsets = [
        ( 0.022, 0.065), # Index
        ( 0.007, 0.072), # Middle
        (-0.008, 0.068), # Ring
        (-0.023, 0.055)  # Pinky
    ]
    for fx_off, flen in finger_offsets:
        fx = cx + fx_off * sign
        f1, f1_uv = create_sculpted_box_mesh([0.014, flen * 0.45, 0.014], [fx, cy - 0.078, cz + 0.015], (0.55, 0.80, 0.70, 0.95))
        f2, f2_uv = create_sculpted_box_mesh([0.012, flen * 0.35, 0.012], [fx, cy - 0.100, cz + 0.028], (0.55, 0.80, 0.70, 0.95))
        f3, f3_uv = create_sculpted_box_mesh([0.010, flen * 0.25, 0.010], [fx, cy - 0.114, cz + 0.038], (0.55, 0.80, 0.70, 0.95))
        hand_parts.extend([f1, f2, f3])
        hand_uvs.extend([f1_uv, f2_uv, f3_uv])
        
    return hand_parts, hand_uvs

l_hand_parts, l_hand_uvs = build_5_finger_hand([-0.25, 0.69, 0.18], is_left=True)
r_hand_parts, r_hand_uvs = build_5_finger_hand([ 0.25, 0.69, 0.18], is_left=False)

arm_meshes.extend(l_hand_parts + r_hand_parts)
arm_uv_list.extend(l_hand_uvs + r_hand_uvs)


# ══════════════════════════════════════════════════════════════════════════════
# 4. TAILORED WHITE TROUSERS & LEGS
# Atlas UV Quadrant 3: U [0.0, 0.5], V [0.0, 0.5]
# ══════════════════════════════════════════════════════════════════════════════
leg_meshes = []
leg_uv_list = []

# Left Leg: Tailored White Slacks (Standing Swagger Stance)
l_leg_rings = [
    [-0.105, 0.78, 0.00, 0.095, 0.095], # Hip & Crotch base
    [-0.115, 0.66, 0.01, 0.086, 0.086], # Upper thigh
    [-0.122, 0.54, 0.02, 0.078, 0.078], # Mid thigh
    [-0.122, 0.44, 0.03, 0.072, 0.072], # Knee joint & break fold
    [-0.118, 0.32, 0.01, 0.068, 0.068], # Calf muscle contour
    [-0.112, 0.18, 0.00, 0.062, 0.062], # Lower shin
    [-0.110, 0.07, 0.00, 0.065, 0.065]  # Ankle cuff drape
]
l_leg_mesh, l_leg_uv = create_smooth_tube_mesh(l_leg_rings, (0.0, 0.0, 0.5, 0.5), segments=24)
leg_meshes.append(l_leg_mesh)
leg_uv_list.append(l_leg_uv)

# Right Leg: Tailored White Slacks (Weight support stance)
r_leg_rings = [
    [ 0.105, 0.78, 0.00, 0.095, 0.095],
    [ 0.115, 0.66, 0.00, 0.086, 0.086],
    [ 0.122, 0.54,-0.01, 0.078, 0.078],
    [ 0.122, 0.44, 0.00, 0.072, 0.072],
    [ 0.118, 0.32, 0.01, 0.068, 0.068],
    [ 0.112, 0.18, 0.01, 0.062, 0.062],
    [ 0.110, 0.07, 0.01, 0.065, 0.065]
]
r_leg_mesh, r_leg_uv = create_smooth_tube_mesh(r_leg_rings, (0.0, 0.0, 0.5, 0.5), segments=24)
leg_meshes.append(r_leg_mesh)
leg_uv_list.append(r_leg_uv)


# ══════════════════════════════════════════════════════════════════════════════
# 5. HIGH-GLOSS BLACK LEATHER OXFORD SHOES & SOCKS
# Atlas UV Quadrant 4: U [0.5, 1.0], V [0.0, 0.5]
# ══════════════════════════════════════════════════════════════════════════════
shoe_meshes = []
shoe_uv_list = []

def build_oxford_shoe(shoe_center, is_left=True):
    """
    Creates an anatomically contoured Oxford dress shoe with rounded toe cap, sole, and heel.
    """
    s_parts = []
    s_uvs = []
    cx, cy, cz = shoe_center
    
    # White Dress Sock
    sock, sock_uv = create_sculpted_box_mesh([0.075, 0.045, 0.075], [cx, cy + 0.055, cz], (0.50, 0.00, 0.75, 0.25))
    s_parts.append(sock)
    s_uvs.append(sock_uv)
    
    # Shoe Vamp & Main Upper (Glossy Black Leather)
    upper, u_uv = create_sculpted_box_mesh([0.115, 0.065, 0.230], [cx, cy + 0.032, cz + 0.035], (0.75, 0.00, 1.00, 0.50))
    # Curved Toe Cap (Glossy front dome)
    toe, t_uv = create_sculpted_sphere_mesh(0.048, [cx, cy + 0.024, cz + 0.125], (0.75, 0.15, 1.00, 0.45), subdivisions=2)
    # Distinct Outer Sole Rim (Extends 0.5 cm beyond upper)
    sole, sol_uv = create_sculpted_box_mesh([0.125, 0.016, 0.250], [cx, cy + 0.008, cz + 0.035], (0.75, 0.00, 1.00, 0.50))
    # Raised Block Heel (1.8 cm at rear)
    heel, h_uv = create_sculpted_box_mesh([0.118, 0.020, 0.080], [cx, cy + 0.010, cz - 0.050], (0.75, 0.00, 1.00, 0.50))
    
    s_parts.extend([upper, toe, sole, heel])
    s_uvs.extend([u_uv, t_uv, sol_uv, h_uv])
    return s_parts, s_uvs

l_shoe_parts, l_shoe_uvs = build_oxford_shoe([-0.110, 0.0, 0.02], is_left=True)
r_shoe_parts, r_shoe_uvs = build_oxford_shoe([ 0.110, 0.0, 0.04], is_left=False)

shoe_meshes.extend(l_shoe_parts + r_shoe_parts)
shoe_uv_list.extend(l_shoe_uvs + r_shoe_uvs)


# ══════════════════════════════════════════════════════════════════════════════
# 6. ASSEMBLE ALL BODILY COMPONENTS & COMPUTE SMOOTH NORMALS
# ══════════════════════════════════════════════════════════════════════════════
all_body_meshes = (
    head_meshes +
    torso_meshes +
    arm_meshes +
    leg_meshes +
    shoe_meshes
)

all_body_uvs = (
    head_uv_list +
    torso_uv_list +
    arm_uv_list +
    leg_uv_list +
    shoe_uv_list
)

total_verts = []
total_faces = []
total_uv_coords = []
v_idx_offset = 0

for m, uv_arr in zip(all_body_meshes, all_body_uvs):
    total_verts.append(m.vertices)
    total_faces.append(m.faces + v_idx_offset)
    total_uv_coords.append(uv_arr)
    v_idx_offset += len(m.vertices)

full_vertices = np.vstack(total_verts).astype(np.float32)
full_faces = np.vstack(total_faces).astype(np.int32)
full_uvs = np.vstack(total_uv_coords).astype(np.float32)

# Create final unified trimesh
character_mesh = trimesh.Trimesh(vertices=full_vertices, faces=full_faces)

# Load generated 2048x2048 master textures
diffuse_img = Image.open('public/textures/ravi/ravi_character_atlas.jpg')

# Configure PBR Texture Visuals
character_mesh.visual = trimesh.visual.TextureVisuals(
    uv=full_uvs,
    image=diffuse_img
)

# Set up PBR Material parameters
pbr_mat = trimesh.visual.material.PBRMaterial(
    baseColorTexture=diffuse_img,
    roughnessFactor=0.55,
    metallicFactor=0.10
)
character_mesh.visual.material = pbr_mat

# Export high-fidelity GLB model
glb_export_path = 'public/models/ravi_kishan_character.glb'
character_mesh.export(glb_export_path)

print(f'Successfully sculpted and exported ultra-realistic Ravi Kishan character model:')
print(f'  Target File: {glb_export_path}')
print(f'  Total Vertices: {len(character_mesh.vertices)}')
print(f'  Total Faces: {len(character_mesh.faces)}')
