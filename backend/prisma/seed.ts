import {
  PrismaClient,
  RolInterno,
  EstadoUsuarioExterno,
  OrigenTramite,
  EstadoTramite,
  PrioridadTramite,
  TipoUsuario,
  AccionWorkflow,
  VisibilidadComentario,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed determinístico para BPM Trámites de Oficina...');

  // Limpieza de datos en cascada
  await prisma.comentarioTramite.deleteMany();
  await prisma.documentoTramite.deleteMany();
  await prisma.movimientoTramite.deleteMany();
  await prisma.tramite.deleteMany();
  await prisma.tipoTramite.deleteMany();
  await prisma.usuarioInterno.deleteMany();
  await prisma.usuarioExterno.deleteMany();
  await prisma.area.deleteMany();

  console.log('Tablas limpiadas exitosamente.');

  // 1. Áreas Funcionales
  const areaMesa = await prisma.area.create({
    data: {
      id: '11111111-1111-1111-1111-111111111111',
      nombre: 'Mesa de Entradas',
      codigo: 'MESA-ENT',
      activa: true,
    },
  });

  const areaCompras = await prisma.area.create({
    data: {
      id: '22222222-2222-2222-2222-222222222222',
      nombre: 'Compras y Contrataciones',
      codigo: 'COMPRAS',
      activa: true,
    },
  });

  const areaLegales = await prisma.area.create({
    data: {
      id: '33333333-3333-3333-3333-333333333333',
      nombre: 'Asuntos Legales',
      codigo: 'LEGALES',
      activa: true,
    },
  });

  console.log('Áreas creadas: Mesa de Entradas, Compras, Legales.');

  // Contraseña común para ambiente de pruebas: Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Usuarios Internos (5 Roles completos del sistema)
  const userAdmin = await prisma.usuarioInterno.create({
    data: {
      id: 'a1111111-1111-1111-1111-111111111111',
      nombre: 'Carlos Administrador',
      email: 'admin@bpm.local',
      passwordHash,
      areaId: areaMesa.id,
      rol: RolInterno.ADMIN,
      activo: true,
    },
  });

  const userMesa = await prisma.usuarioInterno.create({
    data: {
      id: 'a2222222-2222-2222-2222-222222222222',
      nombre: 'María Mesa de Entrada',
      email: 'mesa@bpm.local',
      passwordHash,
      areaId: areaMesa.id,
      rol: RolInterno.MESA_ENTRADA,
      activo: true,
    },
  });

  const userOperadorCompras = await prisma.usuarioInterno.create({
    data: {
      id: 'a3333333-3333-3333-3333-333333333333',
      nombre: 'Juan Operador Compras',
      email: 'operador.compras@bpm.local',
      passwordHash,
      areaId: areaCompras.id,
      rol: RolInterno.OPERADOR,
      activo: true,
    },
  });

  const userOperadorLegales = await prisma.usuarioInterno.create({
    data: {
      id: 'a4444444-4444-4444-4444-444444444444',
      nombre: 'Laura Operador Legales',
      email: 'operador.legales@bpm.local',
      passwordHash,
      areaId: areaLegales.id,
      rol: RolInterno.OPERADOR,
      activo: true,
    },
  });

  const userSupervisor = await prisma.usuarioInterno.create({
    data: {
      id: 'a5555555-5555-5555-5555-555555555555',
      nombre: 'Roberto Supervisor Compras',
      email: 'supervisor@bpm.local',
      passwordHash,
      areaId: areaCompras.id,
      rol: RolInterno.SUPERVISOR,
      activo: true,
    },
  });

  const userAuditor = await prisma.usuarioInterno.create({
    data: {
      id: 'a6666666-6666-6666-6666-666666666666',
      nombre: 'Ana Auditora General',
      email: 'auditor@bpm.local',
      passwordHash,
      areaId: areaMesa.id,
      rol: RolInterno.AUDITOR,
      activo: true,
    },
  });

  console.log('Usuarios internos creados con los 5 roles del sistema.');

  // 3. Usuarios Externos
  const userExtAcme = await prisma.usuarioExterno.create({
    data: {
      id: 'e1111111-1111-1111-1111-111111111111',
      nombre: 'Acme Corporation S.A.',
      email: 'proveedor1@externo.local',
      passwordHash,
      documento: '30-11223344-5',
      organizacion: 'Acme Corporation S.A.',
      estado: EstadoUsuarioExterno.ACTIVO,
    },
  });

  const userExtTech = await prisma.usuarioExterno.create({
    data: {
      id: 'e2222222-2222-2222-2222-222222222222',
      nombre: 'Soluciones Tecnológicas S.R.L.',
      email: 'proveedor2@externo.local',
      passwordHash,
      documento: '30-55667788-9',
      organizacion: 'Soluciones Tecnológicas S.R.L.',
      estado: EstadoUsuarioExterno.ACTIVO,
    },
  });

  const userExtCiudadano = await prisma.usuarioExterno.create({
    data: {
      id: 'e3333333-3333-3333-3333-333333333333',
      nombre: 'Juan Ciudadano Pérez',
      email: 'ciudadano@externo.local',
      passwordHash,
      documento: '35123456',
      organizacion: 'Particular',
      estado: EstadoUsuarioExterno.ACTIVO,
    },
  });

  console.log('Usuarios externos creados.');

  // 4. Tipos de Trámite
  const tipoAltaProv = await prisma.tipoTramite.create({
    data: {
      id: 't1111111-1111-1111-1111-111111111111',
      codigo: 'ALTA-PROV',
      nombre: 'Alta de Proveedor en Padrón',
      descripcion: 'Procedimiento para homologación e inscripción de proveedores oficiales',
      slaHoras: 48,
      areaInicialId: areaCompras.id,
      requiereExterno: true,
      permiteInicioExterno: true,
      activo: true,
    },
  });

  const tipoDictamen = await prisma.tipoTramite.create({
    data: {
      id: 't2222222-2222-2222-2222-222222222222',
      codigo: 'DICT-JUR',
      nombre: 'Dictamen Jurídico y Normativo',
      descripcion: 'Consulta legal interna sobre pliegos, contratos o convenios institucionales',
      slaHoras: 72,
      areaInicialId: areaLegales.id,
      requiereExterno: false,
      permiteInicioExterno: false,
      activo: true,
    },
  });

  const tipoPagoFactura = await prisma.tipoTramite.create({
    data: {
      id: 't3333333-3333-3333-3333-333333333333',
      codigo: 'SOL-PAGO',
      nombre: 'Solicitud de Pago y Facturación',
      descripcion: 'Trámite interno que requiere validación o subsanación de factura por parte del contratista externo',
      slaHoras: 24,
      areaInicialId: areaCompras.id,
      requiereExterno: true,
      permiteInicioExterno: false,
      activo: true,
    },
  });

  const tipoReclamo = await prisma.tipoTramite.create({
    data: {
      id: 't4444444-4444-4444-4444-444444444444',
      codigo: 'REC-ADM',
      nombre: 'Reclamo Administrativo Ciudadano',
      descripcion: 'Presentación formal de reclamos ante la Mesa General de Entradas',
      slaHoras: 24,
      areaInicialId: areaMesa.id,
      requiereExterno: true,
      permiteInicioExterno: true,
      activo: true,
    },
  });

  console.log('Tipos de trámite configurados con SLA.');

  // Fechas de referencia
  const ahora = new Date();
  const hace1Dia = new Date(ahora.getTime() - 24 * 3600 * 1000);
  const hace2Dias = new Date(ahora.getTime() - 48 * 3600 * 1000);
  const hace5Dias = new Date(ahora.getTime() - 120 * 3600 * 1000);

  // 5. 11 Trámites con diversidad de estados, circuitos y SLA
  // Trámite 1: BORRADOR (Circuito Externo-Interno)
  const t1 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      numero: 'TRM-2025-0001',
      tipoTramiteId: tipoAltaProv.id,
      titulo: 'Inscripción Padrón Proveedores de Equipamiento IT',
      descripcion: 'Presentación de estatutos, poderes y certificados fiscales para provisión de servidores',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.BORRADOR,
      prioridad: PrioridadTramite.MEDIA,
      areaActualId: areaCompras.id,
      usuarioExternoId: userExtAcme.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtAcme.id,
      fechaCreacion: hace1Dia,
    },
  });

  // Trámite 2: INGRESADO (Circuito Externo-Interno, esperando ser tomado)
  const t2 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002',
      numero: 'TRM-2025-0002',
      tipoTramiteId: tipoAltaProv.id,
      titulo: 'Inscripción Proveedor de Insumos Médicos',
      descripcion: 'Documentación requerida para habilitación ANMAT y libre deuda provincial',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.INGRESADO,
      prioridad: PrioridadTramite.ALTA,
      areaActualId: areaCompras.id,
      usuarioExternoId: userExtTech.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtTech.id,
      fechaCreacion: hace1Dia,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t2.id,
      estadoAnterior: EstadoTramite.BORRADOR,
      estadoNuevo: EstadoTramite.INGRESADO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: userExtTech.id,
      accion: AccionWorkflow.INGRESAR,
      comentario: 'Presentación formal ingresada por mesa digital',
      fecha: hace1Dia,
    },
  });

  // Trámite 3: EN_REVISION (Tomado por Operador Compras)
  const t3 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000003',
      numero: 'TRM-2025-0003',
      tipoTramiteId: tipoAltaProv.id,
      titulo: 'Renovación Anual Proveedor de Librería y Papelería',
      descripcion: 'Actualización balance contable y seguro de caución',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.EN_REVISION,
      prioridad: PrioridadTramite.MEDIA,
      areaActualId: areaCompras.id,
      usuarioAsignadoId: userOperadorCompras.id,
      usuarioExternoId: userExtAcme.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtAcme.id,
      fechaCreacion: hace1Dia,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t3.id,
      estadoAnterior: EstadoTramite.INGRESADO,
      estadoNuevo: EstadoTramite.EN_REVISION,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userOperadorCompras.id,
      accion: AccionWorkflow.TOMAR,
      comentario: 'Tomado para análisis documental',
      fecha: ahora,
    },
  });

  // Trámite 4: OBSERVADO (Esperando subsanación del proveedor)
  const t4 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000004',
      numero: 'TRM-2025-0004',
      tipoTramiteId: tipoAltaProv.id,
      titulo: 'Alta Proveedor Servicios de Seguridad y Vigilancia',
      descripcion: 'Falta certificado de antecedentes de los directores',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.OBSERVADO,
      prioridad: PrioridadTramite.ALTA,
      areaActualId: areaCompras.id,
      usuarioAsignadoId: userOperadorCompras.id,
      usuarioExternoId: userExtAcme.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtAcme.id,
      fechaCreacion: hace2Dias,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t4.id,
      estadoAnterior: EstadoTramite.EN_REVISION,
      estadoNuevo: EstadoTramite.OBSERVADO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userOperadorCompras.id,
      accion: AccionWorkflow.OBSERVAR,
      comentario: 'Se solicita adjuntar poder notarial vigente y constancia de AFIP actualizada',
      fecha: hace1Dia,
    },
  });
  await prisma.comentarioTramite.create({
    data: {
      tramiteId: t4.id,
      mensaje: 'Estimado proveedor, por favor subsane los documentos observados para continuar con la homologación.',
      visibilidad: VisibilidadComentario.EXTERNA,
      autorTipo: TipoUsuario.INTERNO,
      autorId: userOperadorCompras.id,
      fecha: hace1Dia,
    },
  });

  // Trámite 5: DERIVADO (Circuito Interno-Interno: de Compras a Asuntos Legales)
  const t5 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000005',
      numero: 'TRM-2025-0005',
      tipoTramiteId: tipoDictamen.id,
      titulo: 'Dictamen de Pliego Licitación Pública 04/2025',
      descripcion: 'Análisis de cláusulas contractuales de penalidad y rescisión',
      origen: OrigenTramite.INTERNO_INTERNO,
      estado: EstadoTramite.DERIVADO,
      prioridad: PrioridadTramite.URGENTE,
      areaActualId: areaLegales.id,
      creadoPorTipo: TipoUsuario.INTERNO,
      creadoPorId: userOperadorCompras.id,
      fechaCreacion: hace1Dia,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t5.id,
      estadoAnterior: EstadoTramite.EN_REVISION,
      estadoNuevo: EstadoTramite.DERIVADO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaLegales.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userSupervisor.id,
      accion: AccionWorkflow.DERIVAR,
      comentario: 'Derivado a Asuntos Legales para revisión jurídica previa a publicación',
      fecha: ahora,
    },
  });

  // Trámite 6: ESPERANDO_EXTERNO (Circuito Interno-Externo)
  const t6 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000006',
      numero: 'TRM-2025-0006',
      tipoTramiteId: tipoPagoFactura.id,
      titulo: 'Aclaración de Factura B-0001-00004523 Contrato Redes',
      descripcion: 'Diferencia en el cálculo de alícuota de retenciones impositivas',
      origen: OrigenTramite.INTERNO_EXTERNO,
      estado: EstadoTramite.ESPERANDO_EXTERNO,
      prioridad: PrioridadTramite.MEDIA,
      areaActualId: areaCompras.id,
      usuarioAsignadoId: userOperadorCompras.id,
      usuarioExternoId: userExtTech.id,
      creadoPorTipo: TipoUsuario.INTERNO,
      creadoPorId: userOperadorCompras.id,
      fechaCreacion: hace1Dia,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t6.id,
      estadoAnterior: EstadoTramite.INGRESADO,
      estadoNuevo: EstadoTramite.ESPERANDO_EXTERNO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userOperadorCompras.id,
      accion: AccionWorkflow.SOLICITAR_INTERVENCION_EXTERNA,
      comentario: 'Se solicita nota de crédito o rectificativa por diferencia de percepciones',
      fecha: hace1Dia,
    },
  });

  // Trámite 7: ESPERANDO_INTERNO (Circuito Interno-Externo, el externo ya respondió)
  const t7 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000007',
      numero: 'TRM-2025-0007',
      tipoTramiteId: tipoPagoFactura.id,
      titulo: 'Subsanación Comprobante Pago de Servicios Cloud',
      descripcion: 'Respuesta con recibo emitido y nota aclaratoria',
      origen: OrigenTramite.INTERNO_EXTERNO,
      estado: EstadoTramite.ESPERANDO_INTERNO,
      prioridad: PrioridadTramite.ALTA,
      areaActualId: areaCompras.id,
      usuarioAsignadoId: userOperadorCompras.id,
      usuarioExternoId: userExtTech.id,
      creadoPorTipo: TipoUsuario.INTERNO,
      creadoPorId: userOperadorCompras.id,
      fechaCreacion: hace2Dias,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t7.id,
      estadoAnterior: EstadoTramite.ESPERANDO_EXTERNO,
      estadoNuevo: EstadoTramite.ESPERANDO_INTERNO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.EXTERNO,
      usuarioId: userExtTech.id,
      accion: AccionWorkflow.RESPONDER_INTERVENCION_EXTERNA,
      comentario: 'Adjuntamos constancia fiscal rectificada emitida por AFIP',
      fecha: ahora,
    },
  });

  // Trámite 8: APROBADO
  const t8 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000008',
      numero: 'TRM-2025-0008',
      tipoTramiteId: tipoAltaProv.id,
      titulo: 'Alta Proveedor Servicios de Catering y Eventos',
      descripcion: 'Cumplimentó todos los requisitos bromatológicos y fiscales',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.APROBADO,
      prioridad: PrioridadTramite.MEDIA,
      areaActualId: areaCompras.id,
      usuarioAsignadoId: userOperadorCompras.id,
      usuarioExternoId: userExtCiudadano.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtCiudadano.id,
      fechaCreacion: hace2Dias,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t8.id,
      estadoAnterior: EstadoTramite.EN_REVISION,
      estadoNuevo: EstadoTramite.APROBADO,
      areaAnteriorId: areaCompras.id,
      areaNuevaId: areaCompras.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userOperadorCompras.id,
      accion: AccionWorkflow.APROBAR,
      comentario: 'Documentación completa. Habilitación otorgada bajo registro N° 8492.',
      fecha: hace1Dia,
    },
  });

  // Trámite 9: RECHAZADO
  const t9 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000009',
      numero: 'TRM-2025-0009',
      tipoTramiteId: tipoDictamen.id,
      titulo: 'Consulta de Excepción a la Ley de Contrataciones',
      descripcion: 'Solicitud improcedente de contratación directa',
      origen: OrigenTramite.INTERNO_INTERNO,
      estado: EstadoTramite.RECHAZADO,
      prioridad: PrioridadTramite.ALTA,
      areaActualId: areaLegales.id,
      usuarioAsignadoId: userOperadorLegales.id,
      creadoPorTipo: TipoUsuario.INTERNO,
      creadoPorId: userOperadorCompras.id,
      fechaCreacion: hace2Dias,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t9.id,
      estadoAnterior: EstadoTramite.EN_REVISION,
      estadoNuevo: EstadoTramite.RECHAZADO,
      areaAnteriorId: areaLegales.id,
      areaNuevaId: areaLegales.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userOperadorLegales.id,
      accion: AccionWorkflow.RECHAZAR,
      comentario: 'No se configuran los extremos legales de urgencia para excepción.',
      fecha: hace1Dia,
    },
  });

  // Trámite 10: CERRADO (archivado)
  const t10 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000010',
      numero: 'TRM-2025-0010',
      tipoTramiteId: tipoReclamo.id,
      titulo: 'Reclamo por Atención en Mesa General N° 1204',
      descripcion: 'Ciudadano consultó retraso de respuesta que fue resuelto en el acto',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.CERRADO,
      prioridad: PrioridadTramite.BAJA,
      areaActualId: areaMesa.id,
      usuarioAsignadoId: userMesa.id,
      usuarioExternoId: userExtCiudadano.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtCiudadano.id,
      fechaCreacion: hace5Dias,
      fechaCierre: hace2Dias,
    },
  });
  await prisma.movimientoTramite.create({
    data: {
      tramiteId: t10.id,
      estadoAnterior: EstadoTramite.APROBADO,
      estadoNuevo: EstadoTramite.CERRADO,
      areaAnteriorId: areaMesa.id,
      areaNuevaId: areaMesa.id,
      usuarioTipo: TipoUsuario.INTERNO,
      usuarioId: userSupervisor.id,
      accion: AccionWorkflow.CERRAR,
      comentario: 'Trámite finalizado y archivado formalmente',
      fecha: hace2Dias,
    },
  });

  // Trámite 11 (VENCIDO POR SLA - Alerta Crítica):
  const t11 = await prisma.tramite.create({
    data: {
      id: '00000000-0000-0000-0000-000000000011',
      numero: 'TRM-2025-0011',
      tipoTramiteId: tipoReclamo.id,
      titulo: 'Reclamo Urgente por Inconsistencia de Datos en Certificado',
      descripcion: 'Trámite creado hace 5 días sin atención de mesa. Requiere intervención inmediata.',
      origen: OrigenTramite.EXTERNO_INTERNO,
      estado: EstadoTramite.INGRESADO,
      prioridad: PrioridadTramite.URGENTE,
      areaActualId: areaMesa.id,
      usuarioExternoId: userExtCiudadano.id,
      creadoPorTipo: TipoUsuario.EXTERNO,
      creadoPorId: userExtCiudadano.id,
      fechaCreacion: hace5Dias,
    },
  });

  // 6. Documentos y Comentarios de Demostración
  await prisma.documentoTramite.create({
    data: {
      tramiteId: t3.id,
      nombreArchivo: 'estatuto-social-acme-2024.pdf',
      mimeType: 'application/pdf',
      size: 1450200,
      storageKey: 'docs/t3/estatuto-social-acme-2024.pdf',
      subidoPorTipo: TipoUsuario.EXTERNO,
      subidoPorId: userExtAcme.id,
      fechaCarga: hace1Dia,
    },
  });

  await prisma.documentoTramite.create({
    data: {
      tramiteId: t3.id,
      nombreArchivo: 'constancia-cuit-afip.pdf',
      mimeType: 'application/pdf',
      size: 450120,
      storageKey: 'docs/t3/constancia-cuit-afip.pdf',
      subidoPorTipo: TipoUsuario.EXTERNO,
      subidoPorId: userExtAcme.id,
      fechaCarga: hace1Dia,
    },
  });

  await prisma.comentarioTramite.create({
    data: {
      tramiteId: t3.id,
      mensaje: 'Verificado estatuto y poderes de representación legal. Todo en regla.',
      visibilidad: VisibilidadComentario.INTERNA,
      autorTipo: TipoUsuario.INTERNO,
      autorId: userOperadorCompras.id,
      fecha: ahora,
    },
  });

  await prisma.comentarioTramite.create({
    data: {
      tramiteId: t3.id,
      mensaje: 'Estimado proveedor, su documentación se encuentra en etapa de validación final.',
      visibilidad: VisibilidadComentario.EXTERNA,
      autorTipo: TipoUsuario.INTERNO,
      autorId: userOperadorCompras.id,
      fecha: ahora,
    },
  });

  console.log('Seed completado exitosamente: 3 áreas, 6 usuarios internos, 3 usuarios externos, 4 tipos de trámite, 11 trámites con auditoría y documentos.');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
