# 3D Avatar Model

## Hur du laddar ner en gratis 3D-modell från Mixamo

### Steg 1: Skapa Adobe-konto (gratis)
1. Gå till https://www.mixamo.com/
2. Klicka "Log In" och skapa ett gratis Adobe-konto

### Steg 2: Ladda ner modellen
1. Klicka på "Characters" i menyn
2. Sök efter "Y Bot" eller "X Bot" (neutrala humanoid-modeller)
3. Klicka på modellen för att välja den
4. Klicka "Download"
5. Välj format:
   - **Format:** FBX Binary (.fbx)
   - **Pose:** T-pose
6. Klicka "Download"

### Steg 3: Konvertera till GLB
1. Gå till https://gltf.report/ eller använd Blender
2. Ladda upp din FBX-fil
3. Exportera som .glb

### Steg 4: Placera filen
1. Döp filen till `avatar.glb`
2. Placera den i denna mapp: `/public/models/avatar.glb`

### Alternativ: Ready Player Me
1. Gå till https://readyplayer.me/
2. Skapa en gratis avatar
3. Ladda ner som GLB
4. Placera i denna mapp

## Krav på modellen
- Format: GLB (binär GLTF)
- Rigg: Standard humanoid skeleton (Mixamo-kompatibel)
- Pose: T-pose eller A-pose
- Storlek: Max 10MB (rekommenderat < 5MB)

## Ben-namn som stöds
Modellen måste ha dessa ben (eller Mixamo-varianter):
- Hips / mixamorigHips
- Spine / mixamorigSpine
- Spine2 / mixamorigSpine2
- Neck / mixamorigNeck
- Head / mixamorigHead
- LeftArm / mixamorigLeftArm
- RightArm / mixamorigRightArm
- LeftForeArm / mixamorigLeftForeArm
- RightForeArm / mixamorigRightForeArm
- LeftUpLeg / mixamorigLeftUpLeg
- RightUpLeg / mixamorigRightUpLeg
- LeftLeg / mixamorigLeftLeg
- RightLeg / mixamorigRightLeg
