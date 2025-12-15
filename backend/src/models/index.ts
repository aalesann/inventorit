import User from './User';
import Category from './Category';
import Asset from './Asset';
import Inventory from './Inventory';
import RefreshToken from './RefreshToken';
import LoginAttempt from './LoginAttempt';

// Define model associations

// Asset belongs to Category
Asset.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category'
});

Category.hasMany(Asset, {
    foreignKey: 'category_id',
    as: 'assets'
});

// Asset audit associations with User
Asset.belongsTo(User, {
    foreignKey: 'created_by',
    as: 'creator'
});

Asset.belongsTo(User, {
    foreignKey: 'updated_by',
    as: 'updater'
});

Asset.belongsTo(User, {
    foreignKey: 'deleted_by',
    as: 'deleter'
});

// RefreshToken belongs to User
RefreshToken.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

User.hasMany(RefreshToken, {
    foreignKey: 'user_id',
    as: 'refreshTokens'
});

export { User, Category, Asset, Inventory, RefreshToken, LoginAttempt };
