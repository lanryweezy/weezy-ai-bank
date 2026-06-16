import numpy as np
import torch

class GolayCode:
    def __init__(self):
        self.generator_matrix = self._generate_g24()

    def _generate_g24(self):
        I = np.eye(12, dtype=int)
        res = [1, 3, 4, 5, 9]
        B = np.zeros((11, 11), dtype=int)
        for i in range(11):
            for j in range(11):
                if (j - i) % 11 in res:
                    B[i, j] = 1
        A = np.zeros((12, 12), dtype=int)
        A[0, 0] = 0
        A[0, 1:] = 1
        A[1:, 0] = 1
        row1 = [1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0]
        for i in range(11):
            for j in range(11):
                A[i+1, j+1] = row1[(j-i)%11]
        return np.hstack((I, A))

    def get_all_codewords(self):
        bits = np.array([[(i >> j) & 1 for j in range(12)] for i in range(4096)])
        return (bits @ self.generator_matrix) % 2

def fast_round(x):
    return int(np.floor(x + 0.5))

def fast_find_closest_in_chunk(target, C_chunk, parity_shifts):
    N, d = target.shape
    chunk = C_chunk.shape[0]
    best_points = np.zeros((N, d), dtype=np.float32)
    best_dists = np.full(N, 1e20, dtype=np.float32)
    
    for i in range(N):
        t = target[i]
        for j in range(chunk):
            c = C_chunk[j]
            p_shift = parity_shifts[j]
            
            sum_k = 0
            k = np.zeros(24, dtype=np.float32)
            for l in range(24):
                y_val = t[l] - c[l]
                k_val = fast_round(y_val / 4.0)
                k[l] = k_val
                sum_k += int(k_val)
            
            if sum_k % 2 != p_shift:
                max_err = -1.0
                max_idx = 0
                for l in range(24):
                    y_val = t[l] - c[l]
                    err = abs(y_val / 4.0 - k[l])
                    if err > max_err:
                        max_err = err
                        max_idx = l
                
                y_val_max = t[max_idx] - c[max_idx]
                if y_val_max / 4.0 > k[max_idx]:
                    k[max_idx] += 1
                else:
                    k[max_idx] -= 1
            
            dist_sq = 0.0
            for l in range(24):
                p_val = c[l] + 4.0 * k[l]
                diff = t[l] - p_val
                dist_sq += diff * diff
            
            if dist_sq < best_dists[i]:
                best_dists[i] = dist_sq
                for l in range(24):
                    best_points[i, l] = c[l] + 4.0 * k[l]
                    
    return best_points, best_dists

class LeechLattice:
    def __init__(self):
        self.dim = 24
        self.golay = GolayCode()
        self._c_cache = self.golay.get_all_codewords()
        self._sum_c_half = (np.sum(self._c_cache, axis=1) // 2) % 2
        
    def quantify_batch(self, X):
        N = X.shape[0]
        X_f = X.astype(np.float32)
        two_C = 2.0 * self._c_cache.astype(np.float32)
        p1_shifts = self._sum_c_half.astype(np.int32)
        p2_shifts = (p1_shifts + 1) % 2
        
        best_points = np.zeros((N, 24), dtype=np.float32)
        best_dists = np.full(N, 1e20, dtype=np.float32)
        
        C_chunk_size = 512
        for i in range(0, 4096, C_chunk_size):
            C_chunk = two_C[i:i+C_chunk_size]
            chunk_points1, chunk_dists1 = fast_find_closest_in_chunk(X_f, C_chunk, p1_shifts[i:i+C_chunk_size])
            mask1 = chunk_dists1 < best_dists
            if np.any(mask1):
                idx1 = np.where(mask1)[0]
                best_dists[idx1] = chunk_dists1[idx1]
                best_points[idx1] = chunk_points1[idx1]
            
            chunk_points2, chunk_dists2 = fast_find_closest_in_chunk(X_f - 1.0, C_chunk, p2_shifts[i:i+C_chunk_size])
            chunk_points2 += 1.0
            mask2 = chunk_dists2 < best_dists
            if np.any(mask2):
                idx2 = np.where(mask2)[0]
                best_dists[idx2] = chunk_dists2[idx2]
                best_points[idx2] = chunk_points2[idx2]
        
        return best_points.astype(float)

    def quantify(self, x):
        x = np.asarray(x, dtype=np.float32)
        return self.quantify_batch(x[np.newaxis, :])[0]

class EmpireLeechEngine:
    """
    Implements O(1) semantic search by snapping projections to Leech Lattice points.
    Used for instant fraud detection screening.
    """
    def __init__(self):
        self.lattice = LeechLattice()
        self.knowledge_base = {} # lattice_point_hash -> pattern_data

    def register_fraud_pattern(self, description, encoder, st_model):
        """ Projects a known fraud pattern into the lattice. """
        emb_384 = st_model.encode([description])
        with torch.no_grad():
            proj_24, _ = encoder(torch.tensor(emb_384).to(next(encoder.parameters()).device))
        
        lp = self.lattice.quantify(proj_24.cpu().numpy()[0])
        lp_hash = hash(lp.tobytes())
        self.knowledge_base[lp_hash] = {
            "description": description,
            "lattice_point": lp
        }
        return lp_hash

    def instant_check(self, proj_24_vec):
        """ O(1) lookup: Snaps input to lattice and checks knowledge base. """
        lp = self.lattice.quantify(proj_24_vec)
        lp_hash = hash(lp.tobytes())
        
        match = self.knowledge_base.get(lp_hash)
        if match:
            return True, match["description"]
        return False, None
