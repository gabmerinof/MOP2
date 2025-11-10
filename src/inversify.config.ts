import { Container } from "inversify";
import { IController } from "./controllers/Interfaces/IController";
import { ControllerDiscovery } from "./utils/controller-discovery.util";

export class ContainerConfig {
    private container: Container;
    private controllerClasses: (new (...args: any[]) => IController)[] = [];

    constructor() {
        this.container = new Container();
    }

    async configure() {
        try {
            await this.configureServices();

            this.controllerClasses = await ControllerDiscovery.discoverControllers();
        } catch (error) {
            console.error('Error configuración el contenedor:', error);
            throw error;
        }
    }

    private async configureServices(): Promise<void> {
        // Aquí puedes configurar servicios que no usen autoBind
        // this.container.bind<UserService>(UserService).toSelf();
    }

    getAllControllers(): IController[] {
        const controllers: IController[] = [];

        for (const ControllerClass of this.controllerClasses) {
            try {
                const controller = this.container.get<IController>(ControllerClass, { autobind: true });
                controllers.push(controller);
            } catch (error) {
                console.error(`Error obteniendo el controlador ${ControllerClass.name}:`, error);
            }
        }

        return controllers;
    }

    getContainer(): Container {
        return this.container;
    }
}