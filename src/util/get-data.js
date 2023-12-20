// @ts-ignore
/* eslint-disable global-require, import/no-dynamic-require */

/**
 * Get data from component based js files in ./src/data folder.
 *
 * @param {string} property - Data property or data property chain seperated with .
 * @param {string} file - Full path of javascript data file
 *
 * getData('firstLevelChildProperty', 'component/links.js');
 * @example
 * // component/links.js file has links object.
 * // So this function
 * // returns links.firstLevelChild property's value into .njk file
 * getData('prop.secondLevelProp.ThirdLevel', 'component/links.js');
 * @example
 * // component/links.js file has links object.
 * // So this function
 * // returns links.prop.secondLevelProp.ThirdLevel property's value into .njk file
*/
// @ts-ignore
module.exports = function getData(property, file) {
    /**
     * This function requires modules inside ../data folder.
     *
     * @requires module:../data
     * */
    const dataObj = require(`../data/${file}`);

    /**
     * Check if the property is direct child of data object or
     * nested object property like objProp.innerprop
     * property string is converted into array by seperating `.` character.
     */
    const data = property.split('.').reduce((prev, cur) => prev[cur], dataObj);

    return data;
};
