import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface Comentario {
  id: number
  usuario: string
  titulo: string
  descripcion: string
  categoria: string
  estado: string
  fecha: Date
  likes: number
}

interface Usuario {
  id: number
  nombre: string
  email: string
  telefono: string
  ciudad: string
  fechaRegistro: Date
  estado: string
}

@Component({
  selector: "app-report-export",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./report-export.component.html",
  styleUrls: ["./report-export.component.css"],
})
export class ReportExportComponent implements OnInit {
  comentarios: Comentario[] = []
  usuarios: Usuario[] = []
  generandoPDF = false
  tipoReporte: "comentarios" | "usuarios" = "comentarios"

  ngOnInit(): void {
    this.cargarDatos()
  }

  cargarDatos(): void {
    this.comentarios = [
      {
        id: 1,
        usuario: "Juan Pérez",
        titulo: "Pista con hueco profundo",
        descripcion: "En la Carrera 5 hay un hueco muy profundo que puede causar accidentes.",
        categoria: "Pista rota",
        estado: "Pendiente",
        fecha: new Date("2024-11-28"),
        likes: 5,
      },
      {
        id: 2,
        usuario: "María González",
        titulo: "Semáforo no funciona",
        descripcion: "El semáforo de la intersección Calle 3 y Carrera 7 está apagado.",
        categoria: "Semáforo dañado",
        estado: "En Revisión",
        fecha: new Date("2024-11-27"),
        likes: 12,
      },
      {
        id: 3,
        usuario: "Carlos López",
        titulo: "Poste de luz caído",
        descripcion: "Poste de alumbrado público caído en la Avenida Principal.",
        categoria: "Poste caído",
        estado: "Resuelto",
        fecha: new Date("2024-11-25"),
        likes: 8,
      },
    ]

    this.usuarios = [
      {
        id: 1,
        nombre: "Juan Pérez",
        email: "juan@example.com",
        telefono: "+57 300 123 4567",
        ciudad: "Bogotá",
        fechaRegistro: new Date("2024-10-15"),
        estado: "Activo",
      },
      {
        id: 2,
        nombre: "María González",
        email: "maria@example.com",
        telefono: "+57 301 234 5678",
        ciudad: "Medellín",
        fechaRegistro: new Date("2024-10-20"),
        estado: "Activo",
      },
      {
        id: 3,
        nombre: "Carlos López",
        email: "carlos@example.com",
        telefono: "+57 302 345 6789",
        ciudad: "Cali",
        fechaRegistro: new Date("2024-11-01"),
        estado: "Activo",
      },
      {
        id: 4,
        nombre: "Ana Martínez",
        email: "ana@example.com",
        telefono: "+57 303 456 7890",
        ciudad: "Barranquilla",
        fechaRegistro: new Date("2024-11-10"),
        estado: "Inactivo",
      },
    ]
  }

  generarPDFComentarios(): void {
    this.generandoPDF = true

    try {
      const fecha = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Quejas y Comentarios</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .header {
              border-bottom: 3px solid #5f5cf6;
              margin-bottom: 20px;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 24px;
            }
            .header .info {
              color: #6b7280;
              font-size: 12px;
              margin-top: 5px;
            }
            .comentario {
              border-left: 4px solid #5f5cf6;
              padding: 15px;
              margin-bottom: 15px;
              background: #f9fafb;
              page-break-inside: avoid;
            }
            .comentario-titulo {
              font-weight: bold;
              color: #5f5cf6;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .comentario-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 12px;
              color: #374151;
              margin-bottom: 8px;
            }
            .comentario-desc {
              font-size: 12px;
              color: #4b5563;
              margin-bottom: 8px;
              line-height: 1.4;
            }
            .comentario-footer {
              font-size: 11px;
              color: #9ca3af;
            }
            .estadistica {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }
            .stat {
              padding: 10px 15px;
              background: #e0e7ff;
              border-radius: 8px;
              text-align: center;
            }
            .stat-numero {
              font-size: 18px;
              font-weight: bold;
              color: #5f5cf6;
            }
            .stat-label {
              font-size: 12px;
              color: #6366f1;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Quejas y Comentarios</h1>
            <div class="info">
              <p>Generado el: ${fecha} | Total de quejas: ${this.comentarios.length}</p>
            </div>
          </div>
          <div class="estadistica">
            <div class="stat">
              <div class="stat-numero">${this.comentarios.length}</div>
              <div class="stat-label">Quejas Registradas</div>
            </div>
            <div class="stat">
              <div class="stat-numero">${this.comentarios.filter((c) => c.estado === "Resuelto").length}</div>
              <div class="stat-label">Resueltas</div>
            </div>
            <div class="stat">
              <div class="stat-numero">${this.comentarios.filter((c) => c.estado === "Pendiente").length}</div>
              <div class="stat-label">Pendientes</div>
            </div>
          </div>
          ${this.comentarios
            .map(
              (comentario) => `
            <div class="comentario">
              <div class="comentario-titulo">#${comentario.id} - ${comentario.titulo}</div>
              <div class="comentario-info">
                <div><strong>Usuario:</strong> ${comentario.usuario}</div>
                <div><strong>Categoría:</strong> ${comentario.categoria}</div>
                <div><strong>Estado:</strong> ${comentario.estado}</div>
                <div><strong>Fecha:</strong> ${comentario.fecha.toLocaleDateString()}</div>
              </div>
              <div class="comentario-desc"><strong>Descripción:</strong> ${comentario.descripcion}</div>
              <div class="comentario-footer">Apoyos: ${comentario.likes}</div>
            </div>
          `,
            )
            .join("")}
        </body>
        </html>
      `

      const ventana = window.open("", "", "width=900,height=600")
      if (ventana) {
        ventana.document.write(contenidoHTML)
        ventana.document.close()
        setTimeout(() => {
          ventana.print()
          ventana.close()
        }, 250)
      }
      alert("Se abrió la ventana de impresión. Selecciona 'Guardar como PDF' para descargar.")
    } catch (error) {
      console.error("Error al generar PDF de quejas:", error)
      alert("Error al generar el PDF")
    } finally {
      this.generandoPDF = false
    }
  }

  generarPDFUsuarios(): void {
    this.generandoPDF = true

    try {
      const fecha = new Date().toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Usuarios Registrados</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              background: white;
            }
            .header {
              border-bottom: 3px solid #5f5cf6;
              margin-bottom: 20px;
              padding-bottom: 15px;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 24px;
            }
            .header .info {
              color: #6b7280;
              font-size: 12px;
              margin-top: 5px;
            }
            .usuario {
              border-left: 4px solid #5f5cf6;
              padding: 15px;
              margin-bottom: 15px;
              background: #f9fafb;
              page-break-inside: avoid;
            }
            .usuario-nombre {
              font-weight: bold;
              color: #5f5cf6;
              font-size: 14px;
              margin-bottom: 8px;
            }
            .usuario-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              font-size: 12px;
              color: #374151;
              margin-bottom: 8px;
            }
            .estadistica {
              display: flex;
              gap: 20px;
              margin-bottom: 20px;
            }
            .stat {
              padding: 10px 15px;
              background: #e0e7ff;
              border-radius: 8px;
              text-align: center;
            }
            .stat-numero {
              font-size: 18px;
              font-weight: bold;
              color: #5f5cf6;
            }
            .stat-label {
              font-size: 12px;
              color: #6366f1;
            }
            .estado-activo {
              color: #10b981;
              font-weight: bold;
            }
            .estado-inactivo {
              color: #ef4444;
              font-weight: bold;
            }
            @media print {
              body { margin: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte de Usuarios Registrados</h1>
            <div class="info">
              <p>Generado el: ${fecha} | Total de usuarios: ${this.usuarios.length}</p>
            </div>
          </div>
          <div class="estadistica">
            <div class="stat">
              <div class="stat-numero">${this.usuarios.length}</div>
              <div class="stat-label">Total de Usuarios</div>
            </div>
            <div class="stat">
              <div class="stat-numero">${this.usuarios.filter((u) => u.estado === "Activo").length}</div>
              <div class="stat-label">Usuarios Activos</div>
            </div>
            <div class="stat">
              <div class="stat-numero">${this.usuarios.filter((u) => u.estado === "Inactivo").length}</div>
              <div class="stat-label">Usuarios Inactivos</div>
            </div>
          </div>
          ${this.usuarios
            .map(
              (usuario) => `
            <div class="usuario">
              <div class="usuario-nombre">#${usuario.id} - ${usuario.nombre}</div>
              <div class="usuario-info">
                <div><strong>Email:</strong> ${usuario.email}</div>
                <div><strong>Teléfono:</strong> ${usuario.telefono}</div>
                <div><strong>Ciudad:</strong> ${usuario.ciudad}</div>
                <div><strong>Registro:</strong> ${usuario.fechaRegistro.toLocaleDateString()}</div>
              </div>
              <div><strong>Estado:</strong> <span class="${usuario.estado === "Activo" ? "estado-activo" : "estado-inactivo"}">${usuario.estado}</span></div>
            </div>
          `,
            )
            .join("")}
        </body>
        </html>
      `

      const ventana = window.open("", "", "width=900,height=600")
      if (ventana) {
        ventana.document.write(contenidoHTML)
        ventana.document.close()
        setTimeout(() => {
          ventana.print()
          ventana.close()
        }, 250)
      }
      alert("Se abrió la ventana de impresión. Selecciona 'Guardar como PDF' para descargar.")
    } catch (error) {
      console.error("Error al generar PDF de usuarios:", error)
      alert("Error al generar el PDF")
    } finally {
      this.generandoPDF = false
    }
  }

  descargarReporte(): void {
    if (this.tipoReporte === "comentarios") {
      this.generarPDFComentarios()
    } else {
      this.generarPDFUsuarios()
    }
  }
}
