import Category from '../models/Category';
import { CategoryCreationAttributes, CategoryAttributes } from '../models/Category';

class CategoryRepository {
    async findAll(): Promise<Category[]> {
        return await Category.findAll({
            where: { is_active: true },
            order: [['nombre', 'ASC']]
        });
    }

    async findById(id: number): Promise<Category | null> {
        return await Category.findByPk(id);
    }

    async findByName(nombre: string): Promise<Category | null> {
        return await Category.findOne({ where: { nombre } });
    }

    async create(data: CategoryCreationAttributes): Promise<Category> {
        return await Category.create(data);
    }

    async update(id: number, data: Partial<CategoryAttributes>): Promise<Category | null> {
        const category = await Category.findByPk(id);
        if (!category) {
            return null;
        }

        await category.update(data);
        return category;
    }

    async findOrCreate(data: CategoryCreationAttributes): Promise<[Category, boolean]> {
        return await Category.findOrCreate({
            where: { nombre: data.nombre },
            defaults: data
        });
    }
}

export default new CategoryRepository();
