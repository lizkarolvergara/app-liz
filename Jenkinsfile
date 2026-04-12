pipeline {
    agent any

    environment {
        APP_NAME = "app-liz"
        APP_VERSION = "1.0.${BUILD_NUMBER}"
    }

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                echo "🔄 Clonando repositorio..."

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
                echo "📂 Verificando estructura..."

                sh """
                pwd
                ls -la
                """
            }
        }

        stage('Clean Docker') {
            steps {
                echo "🧹 Limpiando Docker..."

                sh """
                docker stop app-liz || true
                docker rm app-liz || true
                docker system prune -af || true
                """
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Construyendo imagen..."

                sh """
                docker build -t ${APP_NAME}:${APP_VERSION} .
                """
            }
        }

        stage('Run Tests') {
            steps {
                echo "🧪 Ejecutando tests..."

                sh """
                docker run --rm ${APP_NAME}:${APP_VERSION} npm test
                """
            }
        }

        stage('Deploy') {
            steps {
                echo "🚀 Desplegando app..."

                sh """
                docker run -d -p 3001:3000 --name app-liz ${APP_NAME}:${APP_VERSION}
                """
            }
        }

        stage('Verify Container') {
            steps {
                echo "🔍 Verificando contenedor..."

                sh """
                docker ps
                """
            }
        }

    }

    post {
        always {
            echo "🧹 Pipeline finalizado"
        }
        success {
            echo "🎉 App funcionando correctamente"
        }
        failure {
            echo "❌ Error en pipeline"
        }
    }
}