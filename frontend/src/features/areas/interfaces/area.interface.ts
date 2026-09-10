export interface Area {
  id: string;
  nombre: string;
  codigo: string;
  activa: boolean;
}

export interface AreaFormValues {
  nombre: string;
  codigo: string;
  activa: boolean;
}

export interface AreaTableProps {
  areas: Area[];
  onEdit: (area: Area) => void;
}

export interface AreaCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AreaFormValues) => Promise<boolean>;
}

export interface AreaEditModalProps {
  open: boolean;
  area: Area | null;
  onClose: () => void;
  onSubmit: (id: string, values: AreaFormValues) => Promise<boolean>;
}
