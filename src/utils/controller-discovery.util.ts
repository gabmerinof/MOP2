import { glob } from 'glob';
import path from 'path';
import { IController } from '../controllers/Interfaces/IController';

export class ControllerDiscovery {

    static async discoverControllers(pattern: string = '**/*.controller.ts'): Promise<{ new(...args: any[]): IController }[]> {
        const controllerClasses: { new(...args: any[]): IController }[] = [];

        try {
            const files = await glob(pattern, {
                ignore: ['**/*.d.ts', '**/node_modules/**', '**/dist/**'],
                absolute: true
            });

            for (const file of files) {
                const controllerClass = await this.loadControllerFromFile(file);
                if (controllerClass)
                    controllerClasses.push(controllerClass);
            }

            return controllerClasses;
        } catch (error) {
            console.error('Error al configurar los controladores:', error);
            return [];
        }
    }

    private static async loadControllerFromFile(filePath: string): Promise<{ new(...args: any[]): IController } | null> {
        try {

            const normalizedPath = path.resolve(filePath);

            if (filePath.endsWith('.ts')) {
                const modulePath = normalizedPath.replace(/\.ts$/, '');
                delete require.cache[require.resolve(modulePath)];
                const module = require(modulePath);

                return module.default;
            }

            return null;
        } catch (error) {
            console.error(`Error al cargar los controladores desde ${filePath}:`, error);
            return null;
        }
    }
}