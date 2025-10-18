# Required 3D Asset Files for Moduvo Platform

The following 3D model files are required for the AR/VR functionality but are missing from the repository. These files must be uploaded to your object storage bucket and made publicly accessible:

## Missing Files:

- cabinet_combo_charcoal.glb
- cabinet_combo_charcoal.usdz
- cabinet_combo_whiteoak.glb
- cabinet_combo_whiteoak.usdz
- cube_unit_black_147x147.glb
- cube_unit_black_147x147.usdz
- cube_unit_oak_147x147.glb
- cube_unit_oak_147x147.usdz
- cube_unit_white_147x147.glb
- cube_unit_white_147x147.usdz
- wardrobe_charcoal_236cm.glb
- wardrobe_charcoal_236cm.usdz
- wardrobe_white_236cm.glb
- wardrobe_white_236cm.usdz

## Upload Instructions:
1. Upload these files to your Google Cloud Storage bucket under the `furniture/` directory
2. Ensure the bucket has public read access for these specific files
3. Verify the public URLs match the paths referenced in the application

## File Format Requirements:
- GLB files: Optimized for web delivery (< 10MB per file recommended)
- USDZ files: Required for iOS AR Quick Look compatibility
- All models should be centered at origin with realistic scale (1 unit = 1 meter)

## Technical Notes:
These asset paths are referenced in `client/src/data/modular-storage.ts` and must be accessible via the `/public-objects/` route when the application is deployed.
