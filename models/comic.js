'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Comic extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
		}
	}
	Comic.init(
		{
			title: DataTypes.STRING,
			slug: DataTypes.STRING,
			writer: DataTypes.STRING,
			publisher: DataTypes.STRING,
			cover: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Comic',
		}
	);

	return Comic;
};
