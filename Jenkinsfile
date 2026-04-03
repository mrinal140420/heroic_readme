pipeline {
    agent any

    environment {
        AWS_REGION      = 'ap-south-1'
        AWS_ACCOUNT_ID  = '877485452541'
        ECR_REPO        = 'node/heroic'
        IMAGE_NAME      = 'heroic'
        IMAGE_TAG       = "${BUILD_NUMBER}"
        ECR_URI         = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
        CLUSTER_NAME    = 'heroic-cluster'
        DEPLOYMENT_NAME = 'heroic'
        CONTAINER_NAME  = 'heroic'
        K8S_NAMESPACE   = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'master',
                    url: 'https://github.com/mrinal140420/heroic_readme.git'
            }
        }

        stage('Verify Tools and AWS Identity') {
            steps {
                sh '''
                    set -euo pipefail
                    docker --version
                    aws --version
                    kubectl version --client

                    echo "AWS identity in Jenkins:"
                    aws sts get-caller-identity

                    test -f Dockerfile
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -euo pipefail
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:latest
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -euo pipefail
                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    set -euo pipefail
                    docker push ${ECR_URI}:${IMAGE_TAG}
                    docker push ${ECR_URI}:latest
                '''
            }
        }

        stage('Configure kubectl for EKS') {
            steps {
                sh '''
                    set -euo pipefail

                    mkdir -p ~/.kube

                    aws eks update-kubeconfig \
                      --region ${AWS_REGION} \
                      --name ${CLUSTER_NAME}

                    kubectl config current-context

                    echo "Testing cluster auth..."
                    kubectl auth can-i get nodes || true
                    kubectl get ns
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    set -euo pipefail

                    kubectl -n ${K8S_NAMESPACE} set image deployment/${DEPLOYMENT_NAME} \
                      ${CONTAINER_NAME}=${ECR_URI}:${IMAGE_TAG}

                    kubectl -n ${K8S_NAMESPACE} rollout status deployment/${DEPLOYMENT_NAME} --timeout=300s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -euo pipefail
                    kubectl -n ${K8S_NAMESPACE} get deployment ${DEPLOYMENT_NAME} -o wide
                    kubectl -n ${K8S_NAMESPACE} get pods -o wide
                    kubectl -n ${K8S_NAMESPACE} get svc
                '''
            }
        }
    }

    post {
        success {
            echo "Image pushed and deployed successfully: ${ECR_URI}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed"
            sh '''
                set +e
                echo "==== AWS identity ===="
                aws sts get-caller-identity
                echo "==== kubeconfig context ===="
                kubectl config current-context
                echo "==== can-i ===="
                kubectl auth can-i get pods -A
            '''
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
