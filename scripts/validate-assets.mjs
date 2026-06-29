#!/usr/bin/env node

const POLY = "https://dl.polyhaven.org/file/ph-assets";

const ALL_REMOTE_URLS = [
  `${POLY}/HDRIs/hdr/2k/fouriesburg_mountain_lookout_2k.hdr`,
  `${POLY}/Textures/jpg/2k/forrest_ground_01/forrest_ground_01_diff_2k.jpg`,
  `${POLY}/Textures/jpg/2k/forrest_ground_01/forrest_ground_01_nor_gl_2k.jpg`,
  `${POLY}/Textures/jpg/2k/forrest_ground_01/forrest_ground_01_rough_2k.jpg`,
  `${POLY}/Textures/jpg/2k/forrest_ground_01/forrest_ground_01_disp_2k.jpg`,
  `${POLY}/Textures/jpg/2k/rock_face/rock_face_diff_2k.jpg`,
  `${POLY}/Textures/jpg/2k/rock_face/rock_face_nor_gl_2k.jpg`,
  `${POLY}/Textures/jpg/2k/rock_face/rock_face_rough_2k.jpg`,
  `${POLY}/Textures/jpg/2k/snow_01/snow_01_diff_2k.jpg`,
  `${POLY}/Textures/jpg/2k/snow_01/snow_01_nor_gl_2k.jpg`,
  `${POLY}/Textures/jpg/2k/snow_01/snow_01_disp_2k.jpg`,
  `${POLY}/Textures/jpg/2k/mossy_rock/mossy_rock_diff_2k.jpg`,
  `${POLY}/Textures/jpg/2k/mossy_rock/mossy_rock_nor_gl_2k.jpg`,
  `${POLY}/Textures/jpg/2k/bark_brown_02/bark_brown_02_diff_2k.jpg`,
  `${POLY}/Models/gltf/1k/fir_tree_01/fir_tree_01_1k.gltf`,
  `${POLY}/Models/gltf/1k/fir_sapling_medium/fir_sapling_medium_1k.gltf`,
  `${POLY}/Models/gltf/1k/boulder_01/boulder_01_1k.gltf`,
  `${POLY}/Models/gltf/1k/dead_tree_trunk/dead_tree_trunk_1k.gltf`,
];

let failed = 0;

for (const url of ALL_REMOTE_URLS) {
  const res = await fetch(url, { method: "HEAD" });
  const ok = res.status === 200;
  console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${url}`);
  if (!ok) failed++;
}

if (failed > 0) {
  console.error(`\n${failed} asset URL(s) failed validation.`);
  process.exit(1);
}

console.log(`\nAll ${ALL_REMOTE_URLS.length} asset URLs valid.`);
