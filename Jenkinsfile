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

                # detectar cuál está activo
                ACTIVE=$(docker ps --format "{{.Names}}" | grep app-liz-blue || true)

                if [ "$ACTIVE" = "app-liz-blue" ]; then
                    NEW="green"
                    OLD="blue"
                    PORT=3002
                else
                    NEW="blue"
                    OLD="green"
                    PORT=3001
                fi

                echo "Levantando nueva versión en $NEW..."

                docker run -d -p $PORT:3000 --name app-liz-$NEW app-liz:$VERSION

                sleep 5

                echo "Eliminando versión anterior..."

                docker stop app-liz-$OLD || true
                docker rm app-liz-$OLD || true
                '''
            }
        }

    }
}