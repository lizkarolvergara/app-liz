// definición del pipeline de jenkins
pipeline {

    agent any  // se ejecuta en cualquier agente disponible

    environment {
        APP_NAME = "app-liz"                  // nombre de la app
        APP_VERSION = "1.0.${BUILD_NUMBER}"   // versión dinámica por build
    }

    options {
        skipDefaultCheckout(true)  // evita checkout automático
        timestamps()              // agrega timestamps en logs
    }

    stages {

        stage('Checkout') {
            steps {
                echo "Clonando repositorio..."

                // clona el repositorio desde github
                checkout([$class: 'GitSCM',
                    branches: [[name: 'main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/lizkarolvergara/app-liz.git'
                    ]]
                ])
            }
        }

        stage('Verify Project Structure') {
            steps {
                echo "Verificando estructura..."

                // muestra ruta actual y archivos del proyecto
                sh """
                pwd
                ls -la
                """
            }
        }

        stage('Clean Docker') {
            steps {
                echo "Limpiando entorno Docker..."

                // elimina contenedores y limpia recursos
                sh """
                docker-compose down || true
                docker system prune -af || true
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Construyendo imagen..."

                // construye la imagen docker de la app
                sh """
                docker build -t ${APP_NAME}:${APP_VERSION} .
                """
            }
        }

        stage('Run Tests') {
            steps {
                echo "Ejecutando tests..."

                // ejecuta tests dentro de un contenedor temporal
                sh """
                docker run --rm ${APP_NAME}:${APP_VERSION} npm test
                """
            }
        }

        stage('Deploy') {
            steps {
                echo "Desplegando con docker-compose..."

                // levanta los contenedores definidos en docker-compose
                sh """
                docker-compose up -d --build
                """
            }
        }

        stage('Verify Containers') {
            steps {
                echo "Verificando contenedores..."

                // muestra los contenedores en ejecución
                sh """
                docker ps
                """
            }
        }

    }

    post {
        always {
            // se ejecuta siempre al finalizar
            echo "Pipeline finalizado"
        }
        success {
            // si todo salió bien
            echo "Aplicación desplegada correctamente con MySQL"
        }
        failure {
            // si hubo error en alguna etapa
            echo "Error en pipeline"
        }
    }
}