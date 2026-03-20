import os
import glob
import re

def inject_global_assets(root_dir):
    html_files = glob.glob(os.path.join(root_dir, "*.html"))
    custom_css_link = '<link rel="stylesheet" href="./assets/custom.css">'
    custom_js_link = '<script src="./assets/custom.js" defer></script>'
    
    count = 0
    for filepath in html_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            needs_write = False
            
            # 1. Inject CSS if perfectly absent
            if custom_css_link not in content:
                if "</head>" in content:
                    content = content.replace("</head>", f"{custom_css_link}\n</head>")
                    needs_write = True
                else:
                    content += f"\n{custom_css_link}"
                    needs_write = True
                    
            # 2. Inject JS if perfectly absent
            if custom_js_link not in content:
                if "</body>" in content:
                    content = content.replace("</body>", f"{custom_js_link}\n</body>")
                    needs_write = True
                else:
                    content += f"\n{custom_js_link}"
                    needs_write = True
            
            if needs_write:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Injected requested CSS/JS into {os.path.basename(filepath)}")
                count += 1
            else:
                print(f"Skipping {os.path.basename(filepath)}, already perfectly injected.")
                
        except Exception as e:
            print(f"Failed to inject logic into {filepath}: {e}")
            
    print(f"Injected assets into {count} files successfully.")

if __name__ == "__main__":
    target_dir = r"C:\My Web Sites\UZHNAQ"
    print("Starting combined injection scan...")
    inject_global_assets(target_dir)
