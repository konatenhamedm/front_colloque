export type Statut = 'PENDING_PAYMENT' | 'PAYMENT_VALIDATED' | 'ATTENDED_AND_VALIDATED' | 'CERTIFICATE_ISSUED' | 'REJECTED'

export interface Axe { id: number; code: string; libelle: string; ordre: number }
export interface Categorie { id: number; code: string; libelle: string; montant: number }
export interface Intervenant { nom: string; titre: string; photo: string | null }
export interface Canal { code: string; libelle: string; instructions: string }
export interface Colloque {
  titre: string; sousTitre: string | null; theme: string; dateDebut: string; dateFin: string; lieu: string; modalite: string | null
  calendrier: { ordre: number; libelle: string; date: string }[]
  avantages: string[]
  contacts: { email: string; telephones: string[]; beneficiaires: { nom: string; telephones: string[] }[]; organisateurs: string[] }
  canauxPaiement: Canal[]
  intervenants: Intervenant[]
  dateLimitePaiement: string
  axes: Axe[]; categories: Categorie[]
}

export interface User { id: number; email: string; nom: string; prenom: string; telephone: string | null; nomComplet: string }
export interface Fichier { uuid: string; originalName: string; mimeType: string; size: number }
export interface Paiement {
  id: number; canal: string; canalLabel: string; montant: number; reference: string | null
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE'; motifRejet: string | null; justificatif: Fichier | null; createdAt?: string
}
export interface Inscription {
  id: number; uuid: string; utilisateur: User; categorie: Categorie; typeParticipation: 'AUDITEUR' | 'COMMUNICANT'
  institution: string; pays: string | null; statut: Statut; statutLabel: string; motifRejet: string | null
  presence: boolean; paiements: Paiement[]; dernierPaiement: Paiement | null; createdAt: string
}
export interface PaiementQueue extends Paiement {
  inscriptionId: number; participant: string; participantEmail: string; categorieLibelle: string; inscriptionStatut: Statut
}
export interface Session { user: User; roles: string[]; inscription: Inscription | null }

export interface Stats {
  inscrits: { total: number; valides: number; enAttente: number; rejetes: number; participationsValidees: number; attestationsEmises: number }
  tauxConversion: number
  parStatut: { statut: Statut; libelle: string; total: number }[]
  finances: { totalCollecte: number; montantEnAttente: number; parCanal: { canal: string; libelle: string; total: number; montant: number; part: number }[] }
  parCategorie: { categorie: string; total: number }[]
  inscriptionsParJour: { jour: string; total: number }[]
}
