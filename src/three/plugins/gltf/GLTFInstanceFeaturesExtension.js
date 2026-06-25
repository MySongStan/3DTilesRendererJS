import { InstanceFeatures } from './metadata/classes/InstanceFeatures.js';

const EXT_NAME = 'EXT_instance_features';

function forEachInstanceFeaturesExtension( scene, parser, callback ) {

	const { json } = parser;

	scene.traverse( obj => {

		if ( ! parser.associations.has( obj ) ) {

			return;

		}

		const { nodes } = parser.associations.get( obj );
		if ( nodes === undefined ) {

			return;

		}

		const extension = json.nodes[ nodes ]?.extensions?.[ EXT_NAME ];
		if ( ! extension ) {

			return;

		}

		if ( obj.isInstancedMesh ) {

			callback( obj, extension );

		} else {

			obj.traverse( child => {

				if ( child.isInstancedMesh ) {

					callback( child, extension );

				}

			} );

		}

	} );

}

/**
 * GLTF loader plugin that parses the {@link https://github.com/CesiumGS/glTF/tree/3d-tiles-next/extensions/2.0/Vendor/EXT_instance_features EXT_instance_features}
 * extension and attaches an `InstanceFeatures` instance to `instancedMesh.userData.instanceFeatures`
 * on each GPU-instanced node. Register with a `GLTFLoader` via
 * `loader.register( () => new GLTFInstanceFeaturesExtension() )`.
 * @param {Object} parser The GLTF parser instance provided by the loader.
 */
export class GLTFInstanceFeaturesExtension {

	constructor( parser ) {

		this.parser = parser;
		this.name = EXT_NAME;

	}

	async afterRoot( { scene, parser } ) {

		const extensionsUsed = parser.json.extensionsUsed;
		if ( ! extensionsUsed || ! extensionsUsed.includes( EXT_NAME ) ) {

			return;

		}

		forEachInstanceFeaturesExtension( scene, parser, ( instancedMesh, extension ) => {

			instancedMesh.userData.instanceFeatures = new InstanceFeatures( instancedMesh, extension );

		} );

	}

}
