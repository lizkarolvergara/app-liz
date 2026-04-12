pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                sh '''
                VERSION=1.0.$BUILD_NUMBER
                echo "module.exports = { version: \\"$VERSION\\" };" > version.js
                
                docker build -t app-liz:$VERSION .
                echo $VERSION > version.txt
                '''
            }
        }

        stage('Deploy Blue-Green') {
            steps {
                sh '''
                VERSION=$(cat version.txt)

                echo "Limpiando contenedores previos..."
                docker stop app-liz-blue || true
                docker rm app-liz-blue || true
                docker stop app-liz-green || true
                docker rm app-liz-green || true

                echo "Levantando nueva versión (blue)..."
                docker run -d -p 0:3000 --name app-liz-blue app-liz:$VERSION
                '''
            }
        }

    }
}