import * as THREE from 'three';

class GameScene {
    constructor() {
        this.objects = [];
        this.scene = new THREE.Scene();
        
        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);

        this.setupEnvironment();
    }

    setupEnvironment() {
        // Floor
        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(20, 20),
            new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.objects.push(floor);

        // Walls
        const walls = [
            { pos: [0, 5, -10], rot: [0, 0, 0] },
            { pos: [0, 5, 10], rot: [0, Math.PI, 0] },
            { pos: [-10, 5, 0], rot: [0, Math.PI/2, 0] },
            { pos: [10, 5, 0], rot: [0, -Math.PI/2, 0] }
        ];

        walls.forEach(wall => {
            const wallMesh = new THREE.Mesh(
                new THREE.BoxGeometry(20, 10, 0.1),
                new THREE.MeshStandardMaterial({ color: 0xcccccc })
            );
            wallMesh.position.set(...wall.pos);
            wallMesh.rotation.set(...wall.rot);
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            this.scene.add(wallMesh);
            this.objects.push(wallMesh);
        });
    }
}

class Player {
    constructor(scene) {
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, 2, 1),
            new THREE.MeshStandardMaterial({ color: 0x00ff00 })
        );
        this.mesh.position.y = 1;
        this.mesh.castShadow = true;
        
        this.speed = 0.1;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        
        scene.add(this.mesh);
    }

    update(keys) {
        this.direction.set(0, 0, 0);
        
        if (keys.w) this.direction.z -= 1;
        if (keys.s) this.direction.z += 1;
        if (keys.a) this.direction.x -= 1;
        if (keys.d) this.direction.x += 1;

        if (this.direction.length() > 0) {
            this.direction.normalize();
            this.velocity.copy(this.direction).multiplyScalar(this.speed);
            this.mesh.position.add(this.velocity);
        }
    }
}

class Game {
    constructor() {
        console.log("Game initializing..."); // Debug log

        this.container = document.getElementById('game-container');
        this.gameScene = new GameScene();
        this.scene = this.gameScene.scene;
        
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);
        
        this.player = new Player(this.scene);
        this.setupControls();
        this.setupCamera();
        
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);

        console.log("Game initialized"); // Debug log
    }

    setupControls() {
        this.keys = { w: false, s: false, a: false, d: false };
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = true;
            }
        });
        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = false;
            }
        });
    }

    setupCamera() {
        this.camera.position.set(0, 4, 8);
        this.camera.lookAt(this.player.mesh.position);
    }

    updateCamera() {
        const cameraOffset = new THREE.Vector3(0, 4, 8);
        const playerPos = this.player.mesh.position.clone();
        this.camera.position.copy(playerPos).add(cameraOffset);
        this.camera.lookAt(playerPos);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.player.update(this.keys);
        this.updateCamera();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        console.log("Game started successfully");
    } catch (error) {
        console.error("Error starting game:", error);
    }
});