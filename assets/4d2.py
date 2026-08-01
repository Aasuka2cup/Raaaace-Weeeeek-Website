import numpy as np
import matplotlib.pyplot as plt

def generate_web_hopf():
    fig = plt.figure(figsize=(10, 10), facecolor='white')
    ax = fig.add_subplot(111, projection='3d')
    ax.set_axis_off()

    # 参数设置
    n_circles = 120    # 细线条的数量（线网密度）
    n_points = 400     # 每个圆的平滑度
    phi = np.linspace(0, 2 * np.pi, n_points)
    
    R, r = 2.0, 1.2    # 调整比例使中心更接近原图
    
    # 辅助线设置：每隔 15 根线加粗一根
    bold_interval = 15 

    for i, theta in enumerate(np.linspace(0, 2 * np.pi, n_circles)):
        # 维拉索圆方程
        x = (R + r * np.cos(phi)) * np.cos(phi + theta)
        y = (R + r * np.cos(phi)) * np.sin(phi + theta)
        z = r * np.sin(phi)
        
        # --- 色彩控制：从灰蓝到红 ---
        # 我们利用 theta (0 到 2pi) 来映射颜色
        # RdBu_r 是红-白-蓝，我们取其一半或重新映射
        # 这里使用线性插值模拟：左侧灰蓝，右侧红
        ratio = i / n_circles
        color = plt.cm.RdBu_r(ratio) # RdBu_r: 0是红，0.5是灰白，1是蓝
        
        # --- 粗细控制 ---
        if i % bold_interval == 0:
            lw = 1.3          # 加粗辅助线
            alpha = 1.0       # 全透明度
            line_color = 'silver' # 辅助线设为黑色，更像原图
        else:
            lw = 0.6          # 细线
            alpha = 0.5       # 半透明
            line_color = color # 渐变色
            
        ax.plot(x, y, z, color=line_color, lw=lw, alpha=alpha)

    # 视角处理
    ax.view_init(elev=30, azim=0) # 正俯视呈现圆形
    ax.set_box_aspect([1, 1, 0.4]) 
    
    plt.tight_layout()
    #plt.savefig('4d2.png', transparent=True)
    plt.savefig('4d2.svg', transparent=True)
    plt.show()

if __name__ == "__main__":
    generate_web_hopf()
