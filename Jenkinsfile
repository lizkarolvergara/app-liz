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
                sh 'docker run -d -p 3000:3000 app-liz:1.0'
            }
        }
    }
}