import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface FAQ {
  id: number
  question: string
  answer: string
  expanded: boolean
}

interface Category {
  id: number
  name: string
  icon: string
  description: string
}

@Component({
  selector: "app-help",
  imports: [CommonModule, FormsModule],
  templateUrl: "./help.component.html",
  styleUrl: "./help.component.css",
})
export class HelpComponent {
  searchQuery = ""
  selectedCategory: number | null = null

  categories: Category[] = [
    {
      id: 1,
      name: "Primeros Pasos",
      icon: "🚀",
      description: "Aprende lo básico para comenzar",
    },
    {
      id: 2,
      name: "Cuenta y Perfil",
      icon: "👤",
      description: "Gestiona tu cuenta y configuración",
    },
    {
      id: 3,
      name: "Seguridad",
      icon: "🔒",
      description: "Información sobre seguridad y privacidad",
    },
    {
      id: 4,
      name: "Facturación",
      icon: "💳",
      description: "Preguntas sobre pagos y suscripciones",
    },
    {
      id: 5,
      name: "Soporte Técnico",
      icon: "⚙️",
      description: "Resuelve problemas técnicos",
    },
    {
      id: 6,
      name: "Contacto",
      icon: "📧",
      description: "Ponte en contacto con nuestro equipo",
    },
  ]

  faqs: FAQ[] = [
    {
      id: 1,
      question: "¿Cómo creo una cuenta?",
      answer:
        'Para crear una cuenta, haz clic en el botón "Registrarse" en la página principal. Completa el formulario con tu correo electrónico y contraseña, luego verifica tu correo para activar tu cuenta.',
      expanded: false,
    },
    {
      id: 2,
      question: "¿Cómo cambio mi contraseña?",
      answer:
        'Ve a tu perfil, selecciona "Configuración de seguridad" y haz clic en "Cambiar contraseña". Ingresa tu contraseña actual y la nueva contraseña dos veces para confirmar.',
      expanded: false,
    },
    {
      id: 3,
      question: "¿Cuáles son los métodos de pago aceptados?",
      answer:
        "Aceptamos tarjetas de crédito (Visa, Mastercard, American Express), transferencias bancarias y billeteras digitales. Todos los pagos son procesados de forma segura.",
      expanded: false,
    },
    {
      id: 4,
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer:
        "Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. La cancelación será efectiva al final de tu período de facturación actual.",
      expanded: false,
    },
    {
      id: 5,
      question: "¿Cómo recupero mi cuenta si olvido mi contraseña?",
      answer:
        'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y recibirás un enlace para restablecer tu contraseña.',
      expanded: false,
    },
    {
      id: 6,
      question: "¿Qué debo hacer si encuentro un error?",
      answer:
        "Si encuentras un error, por favor contacta a nuestro equipo de soporte con una descripción detallada del problema. Incluye capturas de pantalla si es posible para ayudarnos a resolver el problema más rápidamente.",
      expanded: false,
    },
  ]

  toggleFAQ(faq: FAQ): void {
    faq.expanded = !faq.expanded
  }

  selectCategory(categoryId: number): void {
    this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId
  }

  submitContactForm(event: any): void {
    event.preventDefault()
    console.log("Formulario de contacto enviado")
    alert("Gracias por tu mensaje. Nos pondremos en contacto pronto.")
  }

  get filteredFAQs(): FAQ[] {
    if (!this.searchQuery.trim()) {
      return this.faqs
    }
    return this.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchQuery.toLowerCase()),
    )
  }
}
