pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t app-liz:1.0 .'
            }
        }
        
        stage('Run') {
            steps {
                sh '''
                docker stop app-liz || true
                docker rm app-liz || true
                docker run -d -p 3000:3000 --name app-liz app-liz:1.0
                '''
            }
        }
    }
}