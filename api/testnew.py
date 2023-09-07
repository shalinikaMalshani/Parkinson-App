from fastapi import FastAPI, UploadFile , File
from fastapi.middleware.cors import CORSMiddleware
from torch_geometric.utils.convert import from_scipy_sparse_matrix
import torch
import uvicorn
import numpy as np
import cv2 as cv
import tensorflow as tf
from PIL import Image
from io import BytesIO
import scipy
import warnings
import cv2 as cv
import networkx as nx
import os, glob, torch
import torch_geometric
import tensorflow as tf
import torch.nn.functional as F
from torch_geometric.nn import GCNConv
from torch_geometric.nn import global_mean_pool as gap, \
                               global_max_pool as gmp
warnings.filterwarnings('ignore')


app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get('/hello')
# async def hello():
#     return {"message": "Hello, world!"}

# Load the trained model
model_gcn = tf.keras.models.load_model('models/parkinson-detector-gcn.h5')

def model(x, edge_index):
    edge_index = 1 if (edge_index is not None) else 0
    return model_gcn.predict(x, verbose = edge_index)

class GCN(torch.nn.Module):
    def __init__(self, hidden_channels):
        super(GCN, self).__init__()
        torch.manual_seed(12345)
        self.conv1 = GCNConv(1, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, 1)

    def forward(self, x, edge_index):
        x = self.conv1(x, edge_index).relu()
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        x = gmp(x, batch=None)
        return x

def create_image_chunks(img_path):
    img = cv.imread(img_path)
    img = cv.resize(img, (299, 299))
    img = (img - 127.5) / 127.5
    img = np.expand_dims(img, axis=0)
    img_ = img.copy()
    img = Image.open(img_path).convert('L')
    img = np.expand_dims(img, axis=0)
    img = cv.resize(img, (100, 100))
    img = np.array(img)
    img = img / 255.0

    # Split the image into 10x10 chunks (100)
    chunks = []
    for i in range(0, img.shape[0], 10):
        for j in range(0, img.shape[1], 10):
            chunk = img[i:i+10, j:j+10]
            chunks.append(chunk)

    return chunks, img_

def correlationCoefficient(C1, C2):
    n = C1.size
    sum_C1 = C1.sum()
    sum_C2 = C2.sum()
    sum_C12 = (C1*C2).sum()
    squareSum_C1 = (C1*C1).sum()
    squareSum_C2 = (C2*C2).sum()
    corr = (n * sum_C12 - sum_C1 * sum_C2)/(np.sqrt((n * squareSum_C1 - sum_C1 * sum_C1)* (n * squareSum_C2 - sum_C2 * sum_C2))) 
    return corr

def get_pearson_correlation(chunks):
    corr_matrix = np.zeros((len(chunks), len(chunks)))
    for i in range(len(chunks)):
        for j in range(len(chunks)):
            corr_matrix[i][j] = correlationCoefficient(chunks[i], chunks[j])
    return corr_matrix

def adj2graph(adj):
    coo_adj = scipy.sparse.coo_matrix(adj)
    edge_index, edge_weight = from_scipy_sparse_matrix(coo_adj)
    return edge_index, edge_weight

def image2graph(img_path):
    chunks, img_ = create_image_chunks(img_path)
    corr_matrix = get_pearson_correlation(chunks)

    avg_corr = np.mean(corr_matrix)
    corr_matrix[corr_matrix < avg_corr] = 0
    corr_matrix[corr_matrix >= avg_corr] = 1

    # create chunk nodes as sum of all pixels in the chunk
    node_features = img_ if len(np.array([np.sum(chunk) for chunk in chunks])) > 0 else node_features
    node_features = np.expand_dims(node_features, axis=-1)
    edge_index = adj2graph(corr_matrix)[0]

    return edge_index, node_features

def inference_gcn(img_path):
    img_path = img_path.replace('\\', '/')
    edge_index, node_features = image2graph(img_path)
    out = model(node_features, edge_index)
    confidence = out.squeeze().item()
    label = 'Parkinson' if confidence > 0.5 else 'Healthy'
    return label
    

@app.post('/mri')
async def predict(file: UploadFile):
    try:
        image_path = 'temp_image.jpg'  # Save the uploaded image temporarily
        with open(image_path, 'wb') as f:
            f.write(await file.read())

        prediction = inference_gcn(image_path)

        return {
            'prediction': prediction
        }
    except Exception as e:
        return {
            'error': str(e)
        }


if __name__ == '__main__':
    uvicorn.run(app, host='localhost', port=8000)
