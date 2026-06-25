import { InstancedMesh } from 'three';
import { GLTFLoaderPlugin } from 'three/addons/loaders/GLTFLoader.js';

export class GLTFInstanceFeaturesExtension implements GLTFLoaderPlugin {

	name: 'EXT_instance_features';

}

export interface InstanceFeatureInfo {
	label: string | null;
	propertyTable: number | null;
	nullFeatureId: number | null;
	attribute?: number;
	featureCount?: number;
}

export class InstanceFeatures {

	constructor( instancedMesh: InstancedMesh, data: any );

	getFeatureInfo(): Array<InstanceFeatureInfo>;
	getFeatures( instanceIndex: number ): Array<number | null>;
	dispose(): void;

}

export function ensureInstanceFeatureAttributes( instancedMesh: InstancedMesh ): void;
