import * as THREE from "../lib/three.module.js";

window.addEventListener("DOMContentLoaded", () => {
	const canvas = document.querySelector("#c");
	const app = new ThreeApp(canvas);
	app.init();
	app.render();
});

class ThreeApp {
	constructor(canvas) {
		this.canvas = canvas;

		window.addEventListener("resize", () => {
			this.renderer.setSize(window.innerWidth, window.innerHeight);
			this.camera.aspect = window.innerWidth / window.innerHeight;
			this.camera.updateProjectionMatrix();
		});
	}

	init() {
		// ===== Renderer =====
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			antialias: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor(0x000000);

		// ===== Scene =====
		this.scene = new THREE.Scene();

		// ===== Camera =====
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
		this.camera.position.z = 3;

		// ===== 粒子生成 =====
		this.createParticles();
	}

	createParticles() {
		const img = new Image();
		img.src = "/kadai04/photo.jpeg";

		img.onload = () => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);

			const data = ctx.getImageData(0, 0, img.width, img.height).data;

			const positions = [];
			const colors = [];

			const gap = 6; // 粒子密度（小さいほど重い）

			for (let y = 0; y < img.height; y += gap) {
				for (let x = 0; x < img.width; x += gap) {
					const i = (y * img.width + x) * 4;

					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					const brightness = (r + g + b) / 3;
					if (brightness < 20) continue;

					const px = (x - img.width / 2) / 200;
					const py = -(y - img.height / 2) / 200;

					// 明るさで奥行き
					const pz = (brightness / 255) * 0.5;

					positions.push(px, py, pz);
					colors.push(r / 255, g / 255, b / 255);
				}
			}

			const geometry = new THREE.BufferGeometry();
			geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
			geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

			const material = new THREE.PointsMaterial({
				size: 0.02,
				vertexColors: true,
			});

			this.points = new THREE.Points(geometry, material);
			this.scene.add(this.points);
		};
	}

	render() {
		requestAnimationFrame(() => this.render());

		if (this.points) {
			this.points.rotation.y += 0.001;
		}

		this.renderer.render(this.scene, this.camera);
	}
}
