# Actividad 3 curso virtual de NodeJs

Este proyecto es una aplicación web que permite gestionar cursos con base al rol del usuario. De esta forma:

- Interesado cualquier usuario que acceda al sistema, este puede visualizar que cursos estan disponibles y una descripción de dicho curso.
- Aspirante usuario que se ha registrado en el sistema, este puede ademas inscribirse a un curso, ver en que cursos esta inscrito y desincribirse.
- Coordinador usuario del sistema con privilegios para crear cursos, cerrar cursos, desincribir a usuarios de cursos
- Docente usuario con perfil de docente, que puede asignarse como docente de un curso

# Como usar la aplicación

Para usar el sistema debe contar con los siguientes programas instalados en su entorno local :

- Git
- NodeJs
- NPM
- Mongoose

Para obtener el codigo fuente el comando es :

	git clone https://github.com/nat55555/segundosprintgrupal
	
Una vez descargue el proyecto, dirijase al directorio "actividadsemana2" y ejecute el siguiente comando

	npm i

Finalmente, para iniciar el programa ejecute el comando: 

	node .\src\app.js
	
# Consideraciones generales

- El usuario coordinador por defecto, tiene estos datos de ingreso :
-- identificación = 1
-- clave = admin
- Puede crear un nuevo usuario con rol aspirante en la opción "Registrarme"
- La aplicacion tambien cuenta con algunos cursos y usuarios creados para facilitar las pruebas
- **La funcionalidad de "login" sirve para identificar el usuario que esta usando la aplicacion con base al rol que este tenga podra acceder a ciertas opciones del menu.


# Historias de Usuario

Historia de usuario # 1
	"como usuario necesito poder ingresar a la plataforma utilizando mis credenciales para poder
	visualizar los menú correspondientes a mi rol."

	procedimiento de ejecucion:
		1. Ingresar a la aplicacion en la url: http://localhost:3000/
		2. Dar clik en el boton de "Registrarse"
		3. Diligenciar el formulario
		4. Visitar la pagina sin loguearse para verificar las opciones disponibles para interesados
		5. La opción "Ver cursos disponibles" le permite a interesados consultar los cursos disponibles.
		6. Loguearse con un usuario creado (aspirante) para verificar las opciones disponibles para aspirantes.
		7. La opción "Ver cursos disponibles" le permite a aspirantes consultar los cursos disponibles.		
		8. Los aspirantes pueden optrar por inscribirse a un curso disponible a través de la opción "Inscribirse a un curso".
		9. Loguearse como coordinador (user:1 pass:admin) para verificar las opciones disponibles para el coordinador.
		10. Los usuarios de rol coordinador pueden ver los cursos disponibles en la opción "Ver cursos disponibles".
		11. Los usuarios de rol coordinador pueden visualizar todos los cursos (disponibles y cerrados) a través de la opción "Ver todos los cursos".
		12. Los usuarios de rol docente podrán visualizar la información de los cursos que se les asignaron.
		NOTA: El nombre del usuario y el rol podrá verse en la parte superior derecho de la pantalla.
 
Historia de usuario # 2
	"como coordinador necesito crear cursos de educación continua para ser divulgados entre posibles
	interesados"

	procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/
		2.Ingresar los datos de login del coordinador (user:1 pass:admin)
		3.En el barra de menu acceder al menu "crear curso"
		4.Diligenciar formulario

Historia de usuario # 3
	"Yo como interesado necesito ver una lista de cursos disponibles para identificar cual es el de mi
     interés"

     procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/
     	2.en la barra de menu acceder al menu "Ver cursos"

Historia de usuario # 4 
	"Yo como aspirante necesito realizar mi proceso de inscripción para reservar mi cupo en el curso
         de mi interés"

	procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/
		2.Para ejecutar la historia de usuario se debe estar logeado en la aplicacion con documento y clave, por lo que si no se tiene un usuario, debe hacer el registro y luego loguearse.
		3.Luego en la barra de menu ingresar a la opcion "Inscribirse a un Curso". Allí se listaran los cursos disponibles para hacer la inscripcion.  Seleccionar el curso que quiere inscribir y pulsar el botón inscribir.

Historia de usuario # 5 
	"Yo como aspirante necesito eliminar la inscripción de un curso para asistir a los que realmente
	estoy interesado y evitar ser sancionado por deserción"

	procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/	
		2.Para ejecutar la historia de usuario se debe estar logeado en la aplicacion con documento y clave, de un usuario con rol aspirante.
		3. Para tener la opcion de eliminar una inscripción, primero debe haber creado una (Historia #4)
		4. En la barra de menu ingresar a la opcion "Mis cursos", alli se listarán los cursos en los que se ha inscrito el usuario registrado y se tendrá la opcion de "eliminar inscripción" en la columna de detalles.

Historia de usuario # 6
	"Yo como coordinador de educación continua necesito ver los inscritos por cada uno de los cursos
         para poder tomar la decisión de dar inicio al curso"

	procedimiento de ejecucion:
			1.Ingresar a la aplicación en la url: http://localhost:3000/
			2. Para ejecutar la historia de usuario se debe ingresar en la aplicación como coordinador, para el ingreso como coordinador los datos son docuemento=1 y clave=admin.
			3. Luego, en la barra de menu ingresar a la opcion "Ver Inscriptos"
			   allí  se muestran todos los inscriptos y adicionalmente tendrá 2 opciones
			   Opcción 1.  Frente al nombre de cada curso aparece el link "Cerrar Curso"  para cerrar el curso.
			   Opcción 2.  Frente a cada aspirante inscripto aparece el link "Eliminar Inscripcion"  para borrar a un                                              candidato al curso.
			4. al lado de cado del nombre de cada curso esta el boton de cerrar, el cual direcciona al formulario para  
			   cerrar curso, donde se podra seleccionar al docente que se asignara al curso.


Historia de usuario # 7
	"Yo como coordinador necesito poder eliminar a las personas que ya no están interesadas en el
	curso para poder liberar los cupos del curso facilitando la inscripción a nuevas personas"

	procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/
		2. Loguearse como coordinador ( docuemento=1 y clave=admin).
		3.Opcion 1:
			A. Para ejecutar la historia de usuar se debe ingresar en la aplicación como coordinador ( docuemento=1 y clave=admin).
			B.luego en la barra de menu ingresar a la opcion "Cancelar inscripción"
			alli  se tendra la opcion de seleccionar un usuario, un curso y el botón de "eliminar inscripción" asi como tambien la lista de los cursos con usuarios inscritos.
		Opcion 2: El usuario coordinador también podrá eliminar inscripción usando la opcion de la barra de menu "Ver inscritos"
				  en la aparecara la lista de los cursos con los usuarios inscritos por cada curso y en la columna de detalles se cuenta con la opción de eliminar inscripción
				  
Historia de usuario # 8
	"Yo como coordinador necesito gestionar los roles de los usuarios de mi sistema para poder asignar
	permisos adicionales en el manejo de la plataformas"

	procedimiento de ejecucion:
		1.Ingresar a la aplicación en la url: http://localhost:3000/
		2. Loguearse como coordinador ( docuemento=1 y clave=admin).		
		3.Opcion 1:
			A. En la barra de menu ingresar a la opción "Listar Usuarios" y allí  se tendrá la opcion de editar un usuario.
			B. Una vez realizado los cambios, se debe dar click en el boton "actualizar". Tenga en cuenta que no esta permitido modificar la identificacion o la clave del usuario. 
		  Opcion 2: En la opción de "Editar Usuario", también podrá acceder a modificar el campo "rol" que cuenta con los valores "aspirante" y "docente".
				  				  

Historia de usuario # 8
	"Yo como docente necesito gestionar los cursos que están a mi cargo para poder obtener
	información del mismo y de los estudiantes."

	procedimiento de ejecucion:
		1. Ingresar a la aplicación en la url: http://localhost:3000/
		2. Loguearse con un perfil de docente
		3. En la barra de menú, seleccionar la opción "Cusos docente"

