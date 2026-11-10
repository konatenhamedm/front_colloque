export type Statut = 'PENDING_PAYMENT' | 'PAYMENT_VALIDATED' | 'ATTENDED_AND_VALIDATED' | 'CERTIFICATE_ISSUED' | 'REJECTED'

export interface Axe { id: number; code: string; libelle: string; ordre: number }
export interface Categorie { id: number; code: string; libelle: string; montant: number }
/** Animateur ou logo affiché publiquement (photo = chemin /uploads/... ou null). */
export interface PublicItem { id: number; nom: string; titre: string | null; role: string | null; photo: string | null }
export interface Canal { code: string; libelle: string; numeros: string[]; instructions: string }
export interface Personne { nom: string; telephone: string; email: string }
export interface MembreComite { role: string; nom: string; details: string }
export interface Colloque {
  sigle: string
  titre: string; sousTitre: string | null; theme: string; dateDebut: string; dateFin: string; heures: string | null; prixRepas: number | null; slogan: string | null; lieu: string; modalite: string | null
  cibles: string[]
  calendrier: { ordre: number; libelle: string; date: string }[]
  avantages: string[]
  contacts: { email: string; telephones: string[]; personnes: Personne[]; organisateurs: string[] }
  comite: MembreComite[]
  canauxPaiement: Canal[]
  intervenants: PublicItem[]
  partenaires: PublicItem[]
  dateLimitePaiement: string
  axes: Axe[]; categories: Categorie[]
}
/** Élément géré dans Admin → Paramètres (animateur, signataire ou logo). */
export interface ColloqueItem {
  id: number; type: 'INTERVENANT' | 'SIGNATAIRE' | 'PARTENAIRE'; nom: string; titre: string | null; role: string | null
  details: string | null; ordre: number; imageUrl: string | null; imageUuid: string | null
}
export interface ColloqueAdmin { colloque: Colloque; items: ColloqueItem[] }

export interface User { id: number; email: string; nom: string; prenom: string; telephone: string | null; nomComplet: string }
export interface Fichier { uuid: string; originalName: string; mimeType: string; size: number }
export interface Paiement {
  id: number; canal: string; canalLabel: string; montant: number; reference: string | null
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE'; motifRejet: string | null; justificatif: Fichier | null; createdAt?: string
}
export interface Inscription {
  id: number; uuid: string; utilisateur: User; categorie: Categorie; typeParticipation: 'AUDITEUR' | 'COMMUNICANT'
  institution: string; pays: string | null; statut: Statut; statutLabel: string; motifRejet: string | null
  presence: boolean; repas: boolean; montantTotal: number; paiements: Paiement[]; dernierPaiement: Paiement | null; createdAt: string
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
