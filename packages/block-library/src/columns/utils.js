/**
 * External dependencies
 */
import { sumBy, merge, mapValues } from 'lodash';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Platform } from '@wordpress/element';

/**
 * Returns a column width attribute value rounded to standard precision.
 * Returns `undefined` if the value is not a valid finite number.
 *
 * @param {?number} value Raw value.
 *
 * @return {number} Value rounded to standard precision.
 */
export const toWidthPrecision = ( value ) =>
	Number.isFinite( value ) ? parseFloat( value.toFixed( 2 ) ) : undefined;

/**
 * Returns an effective width for a given block. An effective width is equal to
 * its attribute value if set, or a computed value assuming equal distribution.
 *
 * @param {WPBlock} block           Block object.
 * @param {number}  totalBlockCount Total number of blocks in Columns.
 *
 * @return {number} Effective column width.
 */
export function getEffectiveColumnWidth( block, totalBlockCount ) {
	const { width = 100 / totalBlockCount } = block.attributes;
	return toWidthPrecision( width );
}

/**
 * Returns the total width occupied by the given set of column blocks.
 *
 * @param {WPBlock[]} blocks          Block objects.
 * @param {?number}   totalBlockCount Total number of blocks in Columns.
 *                                    Defaults to number of blocks passed.
 *
 * @return {number} Total width occupied by blocks.
 */
export function getTotalColumnsWidth(
	blocks,
	totalBlockCount = blocks.length
) {
	return sumBy( blocks, ( block ) =>
		getEffectiveColumnWidth( block, totalBlockCount )
	);
}

/**
 * Returns an object of `clientId` → `width` of effective column widths.
 *
 * @param {WPBlock[]} blocks          Block objects.
 * @param {?number}   totalBlockCount Total number of blocks in Columns.
 *                                    Defaults to number of blocks passed.
 *
 * @return {Object<string,number>} Column widths.
 */
export function getColumnWidths( blocks, totalBlockCount = blocks.length ) {
	return blocks.reduce( ( accumulator, block ) => {
		const width = getEffectiveColumnWidth( block, totalBlockCount );
		return Object.assign( accumulator, { [ block.clientId ]: width } );
	}, {} );
}

/**
 * Returns an object of `clientId` → `width` of column widths as redistributed
 * proportional to their current widths, constrained or expanded to fit within
 * the given available width.
 *
 * @param {WPBlock[]} blocks          Block objects.
 * @param {number}    availableWidth  Maximum width to fit within.
 * @param {?number}   totalBlockCount Total number of blocks in Columns.
 *                                    Defaults to number of blocks passed.
 *
 * @return {Object<string,number>} Redistributed column widths.
 */
export function getRedistributedColumnWidths(
	blocks,
	availableWidth,
	totalBlockCount = blocks.length
) {
	const totalWidth = getTotalColumnsWidth( blocks, totalBlockCount );
	const difference = availableWidth - totalWidth;
	const adjustment = difference / blocks.length;

	return mapValues( getColumnWidths( blocks, totalBlockCount ), ( width ) =>
		toWidthPrecision( width + adjustment )
	);
}

/**
 * Returns true if column blocks within the provided set are assigned with
 * explicit widths, or false otherwise.
 *
 * @param {WPBlock[]} blocks Block objects.
 *
 * @return {boolean} Whether columns have explicit widths.
 */
export function hasExplicitColumnWidths( blocks ) {
	return blocks.every( ( block ) =>
		Number.isFinite( block.attributes.width )
	);
}

/**
 * Returns a copy of the given set of blocks with new widths assigned from the
 * provided object of redistributed column widths.
 *
 * @param {WPBlock[]}             blocks Block objects.
 * @param {Object<string,number>} widths Redistributed column widths.
 *
 * @return {WPBlock[]} blocks Mapped block objects.
 */
export function getMappedColumnWidths( blocks, widths ) {
	return blocks.map( ( block ) =>
		merge( {}, block, {
			attributes: {
				width: widths[ block.clientId ],
			},
		} )
	);
}

/**
 * Returns an array with columns widths values, parsed or no depends on `withParsing` flag.
 *
 * @param {WPBlock[]} blocks          Block objects.
 * @param {?boolean} withParsing Whether value has to be parsed.
 * Defaults to number of blocks passed.
 * @return {Array<number,string>} Column widths.
 */
export function getWidths( blocks, withParsing = true ) {
	return blocks.map( ( innerColumn ) => {
		const innerColumnWidth =
			innerColumn.attributes.width || 100 / blocks.length;

		return withParsing ? parseFloat( innerColumnWidth ) : innerColumnWidth;
	} );
}

export const CSS_UNITS = [
	{
		value: '%',
		label: Platform.OS === 'web' ? '%' : __( 'Percentage (%)' ),
		default: '',
	},
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
];
