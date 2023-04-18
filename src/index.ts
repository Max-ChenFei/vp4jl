import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { VPModelFactory } from './model-factory';
import { requestAPI } from './handler';

/**
 * Initialization data for the vp4jl extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'vp4jl:plugin',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension vp4jl is activated!');

    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The vp4jl server extension appears to be missing.\n${reason}`
        );
      });

    app.docRegistry.addModelFactory(new VPModelFactory());
    app.docRegistry.addFileType({
      name: 'vp4jl',
      displayName: 'visual programming for jupyterlab',
      mimeTypes: ['text/json', 'application/json'],
      extensions: ['.vp4jl'],
      fileFormat: 'json',
      contentType: 'file'
    });
  }
};

export default plugin;
