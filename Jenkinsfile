pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh '''
                VERSION=$(date +%s)
                echo "module.exports = { version: \\"$VERSION\\" };" > version.js
                
                docker build -t app-liz:$VERSION .
                echo $VERSION > version.txt
                '''
            }
        }
    }

    stage('Run') {
        steps {
            sh '''
            VERSION=$(cat version.txt)

            docker stop app-liz || true
            docker rm app-liz || true

            docker run -d -p 3001:3000 --name app-liz app-liz:$VERSION
            '''
        }
    }
}
