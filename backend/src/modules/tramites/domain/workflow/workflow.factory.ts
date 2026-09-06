import { OrigenTramite } from '../enums/origen-tramite.enum';
import { ITramiteWorkflow } from './workflow.interface';
import { ExternoInternoWorkflow } from './externo-interno.workflow';
import { InternoInternoWorkflow } from './interno-interno.workflow';
import { InternoExternoWorkflow } from './interno-externo.workflow';

export class WorkflowFactory {
  private static readonly externoInterno = new ExternoInternoWorkflow();
  private static readonly internoInterno = new InternoInternoWorkflow();
  private static readonly internoExterno = new InternoExternoWorkflow();

  static getWorkflow(origen: OrigenTramite): ITramiteWorkflow {
    switch (origen) {
      case OrigenTramite.EXTERNO_INTERNO:
        return this.externoInterno;
      case OrigenTramite.INTERNO_INTERNO:
        return this.internoInterno;
      case OrigenTramite.INTERNO_EXTERNO:
        return this.internoExterno;
      default:
        throw new Error(`Origen de trámite no reconocido: ${origen}`);
    }
  }
}
