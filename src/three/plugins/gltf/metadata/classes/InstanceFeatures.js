/** @import { InstancedMesh, BufferGeometry } from 'three' */
import { InstancedBufferAttribute } from 'three';

const FEATURE_ID_PATTERN = /^_FEATURE_ID_(\d+)$/i;

function getFeatureIdAttributeName( geometry, attributeIndex ) {

	const gltfName = `_FEATURE_ID_${ attributeIndex }`;
	if ( geometry.getAttribute( gltfName ) ) {

		return gltfName;

	}

	const legacyName = `_feature_id_${ attributeIndex }`;
	if ( geometry.getAttribute( legacyName ) ) {

		return legacyName;

	}

	return gltfName;

}

/**
 * Ensures `_FEATURE_ID_n` attributes on an `InstancedMesh` are `InstancedBufferAttribute`.
 * Three.js `GLTFMeshGpuInstancing` may load them as plain `BufferAttribute` objects.
 * @param {InstancedMesh} instancedMesh
 */
export function ensureInstanceFeatureAttributes( instancedMesh ) {

	const { geometry, count } = instancedMesh;

	for ( const name in geometry.attributes ) {

		if ( FEATURE_ID_PATTERN.test( name ) ) {

			const attr = geometry.getAttribute( name );
			if ( attr && ! attr.isInstancedBufferAttribute && attr.count === count ) {

				geometry.setAttribute(
					name,
					new InstancedBufferAttribute( attr.array, attr.itemSize, attr.normalized ),
				);

			}

		}

	}

}

/**
 * @typedef {Object} InstanceFeatureInfo
 * @property {string|null} label
 * @property {number|null} propertyTable
 * @property {number|null} nullFeatureId
 * @property {number} [attribute]
 * @property {number} [featureCount]
 */

/**
 * Provides access to `EXT_instance_features` feature ID data for GPU-instanced glTF nodes.
 * Instances are created by `GLTFInstanceFeaturesExtension` and attached to
 * `instancedMesh.userData.instanceFeatures`. Use `getFeatures()` with a raycast
 * `instanceId` to read per-instance feature IDs.
 * @param {InstancedMesh} instancedMesh The instanced mesh for the glTF node.
 * @param {Object} data The raw `EXT_instance_features` extension object for the node.
 */
export class InstanceFeatures {

	constructor( instancedMesh, data ) {

		this.instancedMesh = instancedMesh;
		this.geometry = instancedMesh.geometry;
		this.data = data;

		ensureInstanceFeatureAttributes( instancedMesh );

		this.featureIds = data.featureIds.map( info => ( {
			label: null,
			propertyTable: null,
			nullFeatureId: null,
			...info,
		} ) );

	}

	/**
	 * Returns the feature ID info for each feature set defined on this node.
	 * @returns {Array<InstanceFeatureInfo>}
	 */
	getFeatureInfo() {

		return this.featureIds;

	}

	/**
	 * Returns feature IDs for the given GPU instance index. Results are indexed in the
	 * same order as the feature info returned by `getFeatureInfo()`.
	 * @param {number} instanceIndex Instance index from a raycast hit (`hit.instanceId`).
	 * @returns {Array<number|null>}
	 */
	getFeatures( instanceIndex ) {

		const { geometry, featureIds } = this;
		const result = new Array( featureIds.length ).fill( null );

		for ( let i = 0, l = featureIds.length; i < l; i ++ ) {

			const featureId = featureIds[ i ];
			const nullFeatureId = 'nullFeatureId' in featureId ? featureId.nullFeatureId : null;

			if ( 'attribute' in featureId ) {

				const attrName = getFeatureIdAttributeName( geometry, featureId.attribute );
				const attr = geometry.getAttribute( attrName );
				if ( attr ) {

					const value = attr.getX( instanceIndex );
					if ( value !== nullFeatureId ) {

						result[ i ] = value;

					}

				}

			} else {

				// implicit id is the instance index, see EXT_instance_features
				const value = instanceIndex;
				if ( value !== nullFeatureId ) {

					result[ i ] = value;

				}

			}

		}

		return result;

	}

	dispose() {}

}
