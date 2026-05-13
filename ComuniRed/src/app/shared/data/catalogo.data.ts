export interface OpcionSelect {
  value: string;
  label: string;
}

export const SEXOS: OpcionSelect[] = [
  { value: '',     label: 'Sin especificar' },
  { value: 'M',   label: 'Masculino' },
  { value: 'F',   label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
];

export const DISTRITOS_LIMA: OpcionSelect[] = [
  { value: '',              label: 'Selecciona un distrito' },
  { value: 'San Isidro',   label: 'San Isidro' },
  { value: 'Miraflores',   label: 'Miraflores' },
  { value: 'Surco',        label: 'Santiago de Surco' },
  { value: 'La Molina',    label: 'La Molina' },
  { value: 'San Borja',    label: 'San Borja' },
  { value: 'Barranco',     label: 'Barranco' },
  { value: 'Jesús María',  label: 'Jesús María' },
  { value: 'Lince',        label: 'Lince' },
  { value: 'Magdalena',    label: 'Magdalena del Mar' },
  { value: 'Pueblo Libre', label: 'Pueblo Libre' },
];