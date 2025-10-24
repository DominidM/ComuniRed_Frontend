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
  styleUrls: ["./help.component.css"], // Fixed unexpected token `\` by correcting styleUrl to styleUrls
})
export class HelpComponent {
  searchQuery = ""
  selectedCategory: number | null = null

  categories: Category[] = [
    {
      id: 1,
      name: "Guía para Nuevos Usuarios",
      icon: "📱",
      description: "Aprende lo básico de ComuniRed",
    },
    {
      id: 2,
      name: "Tutoriales en Video",
      icon: "🎥",
      description: "Videos paso a paso",
    },
    {
      id: 3,
      name: "Comunidad y Foros",
      icon: "👥",
      description: "Conecta con otros usuarios",
    },
  ]

  faqs: FAQ[] = [
    {
      id: 1,
      question: "¿Cómo creo un nuevo reporte?",
      answer:
        'Para crear un nuevo reporte, haz clic en el botón "Crear Reporte" en la página principal. Completa el formulario con los detalles del reporte y selecciona la categoría correspondiente.',
      expanded: false,
    },
    {
      id: 2,
      question: "¿Cómo sé si mi reporte fue atendido?",
      answer:
        "Puedes ver el estado de tu reporte en tu panel de control. Recibirás notificaciones por correo electrónico cuando haya actualizaciones en tu reporte.",
      expanded: false,
    },
    {
      id: 3,
      question: "¿Puedo reportar de forma anónima?",
      answer:
        "Sí, puedes reportar de forma anónima si lo prefieres. Simplemente selecciona la opción de reporte anónimo al crear tu reporte.",
      expanded: false,
    },
    {
      id: 4,
      question: "¿Qué tipo de problemas puedo reportar?",
      answer:
        'Puedes reportar problemas de infraestructura como baches, falta de iluminación, problemas de alcantarillado, acumulación de basura, señalización deteriorada, entre otros.',
      expanded: false,
    },
     {
      id: 5,
      question: "¿Cuánto tiempo tarda en resolverse un reporte?",
      answer:
        'El tiempo de resolución depende de la complejidad y prioridad del problema. Los reportes urgentes suelen atenderse más rápidamente. Recibirás actualizaciones sobre el progreso.',
      expanded: false,
    },
      {
      id: 6,
      question: "¿Cómo adjunto fotos a mi reporte?",
      answer:
        'Sí, puedes y debes adjuntar fotos que evidencien el problema. Esto ayuda a las autoridades a entender mejor la situación y priorizar la atención.',
      expanded: false,
    },
    {
      id: 6,
      question: "¿Qué significan las reacciones?",
      answer:
        'Las reacciones permiten a la comunidad expresar que un problema también les afecta ("Me afecta"), marcar urgencia ("Urgente") o verificar que existe ("Verificado"). Más reacciones pueden aumentar la prioridad.',
      expanded: false,
    },
  ]

  toggleFAQ(faq: FAQ): void {
    faq.expanded = !faq.expanded
  }

  selectCategory(categoryId: number): void {
    this.selectedCategory = this.selectedCategory === categoryId ? null : categoryId
  }

  viewMore(categoryId: number): void {
    console.log("Ver más para categoría:", categoryId)
    // Add navigation or modal logic here
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