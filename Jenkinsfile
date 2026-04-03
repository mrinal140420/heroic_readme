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
        KUBECONFIG      = "${WORKSPACE}/.kube/config"
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
                    set -eu

                    echo "=== Tool versions ==="
                    docker --version
                    aws --version
                    kubectl version --client

                    echo "=== AWS identity in Jenkins ==="
                    aws sts get-caller-identity

                    echo "=== Workspace ==="
                    pwd
                    ls -la

                    test -f Dockerfile
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    set -eu

                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${ECR_URI}:latest
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                    set -eu

                    aws ecr get-login-password --region ${AWS_REGION} | \
                    docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Push to ECR') {
            steps {
                sh '''
                    set -eu

                    docker push ${ECR_URI}:${IMAGE_TAG}
                    docker push ${ECR_URI}:latest
                '''
            }
        }

        stage('Configure kubectl for EKS') {
            steps {
                sh '''
                    set -eu

                    mkdir -p "$(dirname "$KUBECONFIG")"

                    aws eks update-kubeconfig \
                      --region ${AWS_REGION} \
                      --name ${CLUSTER_NAME} \
                      --kubeconfig ${KUBECONFIG}

                    echo "=== Current context ==="
                    kubectl --kubeconfig ${KUBECONFIG} config current-context

                    echo "=== Cluster access ==="
                    kubectl --kubeconfig ${KUBECONFIG} get nodes
                    kubectl --kubeconfig ${KUBECONFIG} get ns
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                    set -eu

                    kubectl --kubeconfig ${KUBECONFIG} -n ${K8S_NAMESPACE} \
                      set image deployment/${DEPLOYMENT_NAME} \
                      ${CONTAINER_NAME}=${ECR_URI}:${IMAGE_TAG}

                    kubectl --kubeconfig ${KUBECONFIG} -n ${K8S_NAMESPACE} \
                      rollout status deployment/${DEPLOYMENT_NAME} --timeout=300s
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh '''
                    set -eu

                    echo "=== Deployment ==="
                    kubectl --kubeconfig ${KUBECONFIG} -n ${K8S_NAMESPACE} \
                      get deployment ${DEPLOYMENT_NAME} -o wide

                    echo "=== Pods ==="
                    kubectl --kubeconfig ${KUBECONFIG} -n ${K8S_NAMESPACE} \
                      get pods -o wide

                    echo "=== Services ==="
                    kubectl --kubeconfig ${KUBECONFIG} -n ${K8S_NAMESPACE} \
                      get svc
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
                aws sts get-caller-identity || true

                echo "==== kubeconfig context ===="
                kubectl --kubeconfig ${KUBECONFIG} config current-context || true

                echo "==== cluster auth test ===="
                kubectl --kubeconfig ${KUBECONFIG} get nodes || true

                echo "==== can-i ===="
                kubectl --kubeconfig ${KUBECONFIG} auth can-i get pods -A || true
            '''
        }

        always {
            sh '''
                set +e
                docker image prune -f || true
            '''
        }
    }
}
