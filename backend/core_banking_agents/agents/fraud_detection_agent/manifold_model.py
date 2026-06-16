import torch
import torch.nn as nn
import torch.nn.functional as F

class SovereignEncoder(nn.Module):
    def __init__(self, input_dim=384, output_dim=24):
        super(SovereignEncoder, self).__init__()
        self.backbone = nn.Linear(input_dim, output_dim)
        self.refiner = nn.Sequential(
            nn.Linear(output_dim, 128),
            nn.LayerNorm(128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, output_dim)
        )
        
    def forward(self, x):
        base = self.backbone(x)
        delta = self.refiner(F.relu(base))
        out = base + 0.1 * delta
        return F.normalize(out, p=2, dim=1), delta
