/**
 * WordPress dependencies
 */
import { getBlobTypeByURL, isBlobURL } from '@wordpress/blob';
import { __ } from '@wordpress/i18n';
import { Platform } from '@wordpress/element';

const POSITION_CLASSNAMES = {
	'top left': 'is-position-top-left',
	'top center': 'is-position-top-center',
	'top right': 'is-position-top-right',
	'center left': 'is-position-center-left',
	'center center': 'is-position-center-center',
	center: 'is-position-center-center',
	'center right': 'is-position-center-right',
	'bottom left': 'is-position-bottom-left',
	'bottom center': 'is-position-bottom-center',
	'bottom right': 'is-position-bottom-right',
};

export const IMAGE_BACKGROUND_TYPE = 'image';
export const VIDEO_BACKGROUND_TYPE = 'video';
export const COVER_MIN_HEIGHT = 50;
export function backgroundImageStyles( url ) {
	return url ? { backgroundImage: `url(${ url })` } : {};
}

export const CSS_UNITS = [
	{
		value: 'px',
		label: Platform.OS === 'web' ? 'px' : __( 'Pixels (px)' ),
		default: '',
	},
	{
		value: 'em',
		label:
			Platform.OS === 'web'
				? 'em'
				: __( 'Relative to parent font size (em)' ),
		default: '',
	},
	{
		value: 'rem',
		label:
			Platform.OS === 'web'
				? 'rem'
				: __( 'Relative to root font size (rem)' ),
		default: '',
	},
	{
		value: 'vw',
		label: Platform.OS === 'web' ? 'vw' : __( 'Viewport width (vw)' ),
		default: '',
	},
	{
		value: 'vh',
		label: Platform.OS === 'web' ? 'vh' : __( 'Viewport height (vh)' ),
		default: '',
	},
];

export function dimRatioToClass( ratio ) {
	return ratio === 0 || ratio === 50 || ! ratio
		? null
		: 'has-background-dim-' + 10 * Math.round( ratio / 10 );
}

export function attributesFromMedia( setAttributes ) {
	return ( media ) => {
		if ( ! media || ! media.url ) {
			setAttributes( { url: undefined, id: undefined } );
			return;
		}

		if ( isBlobURL( media.url ) ) {
			media.type = getBlobTypeByURL( media.url );
		}

		let mediaType;
		// for media selections originated from a file upload.
		if ( media.media_type ) {
			if ( media.media_type === IMAGE_BACKGROUND_TYPE ) {
				mediaType = IMAGE_BACKGROUND_TYPE;
			} else {
				// only images and videos are accepted so if the media_type is not an image we can assume it is a video.
				// Videos contain the media type of 'file' in the object returned from the rest api.
				mediaType = VIDEO_BACKGROUND_TYPE;
			}
		} else {
			// for media selections originated from existing files in the media library.
			if (
				media.type !== IMAGE_BACKGROUND_TYPE &&
				media.type !== VIDEO_BACKGROUND_TYPE
			) {
				return;
			}
			mediaType = media.type;
		}

		setAttributes( {
			url: media.url,
			id: media.id,
			backgroundType: mediaType,
			...( mediaType === VIDEO_BACKGROUND_TYPE
				? { focalPoint: undefined, hasParallax: undefined }
				: {} ),
		} );
	};
}

/**
 * Checks of the contentPosition is the center (default) position.
 *
 * @param {string} contentPosition The current content position.
 * @return {boolean} Whether the contentPosition is center.
 */
export function isContentPositionCenter( contentPosition ) {
	return (
		! contentPosition ||
		contentPosition === 'center center' ||
		contentPosition === 'center'
	);
}

/**
 * Retrieves the className for the current contentPosition.
 * The default position (center) will not have a className.
 *
 * @param {string} contentPosition The current content position.
 * @return {string} The className assigned to the contentPosition.
 */
export function getPositionClassName( contentPosition ) {
	/*
	 * Only render a className if the contentPosition is not center (the default).
	 */
	if ( isContentPositionCenter( contentPosition ) ) return '';

	return POSITION_CLASSNAMES[ contentPosition ];
}
