pipeline {
    agent any

    environment {
        AWS_REGION     = 'ap-south-1'
        AWS_ACCOUNT_ID = '877485452541'
        ECR_REPO       = 'node/heroic'
        IMAGE_NAME     = 'heroic'
        IMAGE_TAG      = "${BUILD_NUMBER}"
        ECR_URI        = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/mrinal140420/heroic_readme.git'
            }
        }

        stage('Verify Tools and Identity') {
            steps {
                sh '''
                    set -e
                    echo "Current workspace:"
                    pwd
                    ls -la

                    echo "Tool versions:"
                    docker --version
                    aws --version

                    echo "AWS identity:"
                    aws sts get-caller-identity

                    echo "Checking Dockerfile:"
                    test -f Dockerfile
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -e
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:latest
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -e
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    set -e
                    docker push ${ECR_URI}:${IMAGE_TAG}
                    docker push ${ECR_URI}:latest
                '''
            }
        }
    }

    post {
        success {
            echo "Image pushed successfully: ${ECR_URI}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed"
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
