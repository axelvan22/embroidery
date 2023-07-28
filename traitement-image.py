'''Program to design the functions of an App
This app will be used to upload photos,
create PNG files from JPEG files,
edit a PNG file or overlay 2 images (PNG on JPEGs)
'''

from PIL import Image
import numpy as np

'''This function is used to transform an RGB image to a PNG image where only dark pixels are visible
    optional param limit sets the value of the pixel to be set visible'''
def transform_rgb(rgb, limit = 128):
    # open the image and transform it to grayscale 
    img_g = Image.open(rgb).convert('L')

    # initialize the PNG image
    img_png = Image.open(rgb).convert('RGBA')
    
    # retrieve all black pixels 
    # and set the rest of the pixels transparent
    img_g_data = np.asarray(img_g).copy()
    img_png_data = np.asarray(img_png).copy()
    width, height = img_g.size
    for y in range(height):
        for x in range(width):
            if img_g_data[y][x] > limit: # if the pixel is white, make it transparent
                img_png_data[y][x] = (0, 0, 0, 0)

    # print and save the image
    img_png = Image.fromarray(img_png_data)
    file_name = 'rgb2png.png'
    img_png.save(file_name, 'png')
    #img_png.show()

    # close images
    img_png.close()
    img_g.close()

    return file_name

'''This function overlay a png image on another image'''
def overlay(png, jpg, pos=(0,0), save = False):
    # open the 2 images
    background = Image.open(jpg).convert("RGBA")
    frontImage = Image.open(png).convert("RGBA")

    # get the size of the images
    back_w, back_h = background.size
    front_w, front_h = frontImage.size
    
    #calculate the new position
    pos = (pos[0] - front_w // 2, pos[1] - front_h // 2)

    #print("front image size before resize ", frontImage.size)

    # resize the front image to appear perfectly in the background
    w_diff = back_w/front_w
    h_diff = back_h/front_h
    if (w_diff < 1) or (h_diff < 1):
        if h_diff > w_diff:
            frontImage = frontImage.resize((back_w,front_h*back_w//front_w))
        else:
            frontImage = frontImage.resize((front_w*back_h//front_h,back_h))

    #print("front image size after resize ", frontImage.size)

    # overlay the background with the front image
    background.paste(frontImage, pos, frontImage)

    if save:
        background.save("embroidery.png", 'png')
    background.show()
    background.close()
    frontImage.close()
    return

'''This function is used to resize an image (mostly the pattern)'''
def image_resize(png, coef):
    # test coef 
    try:
        if coef < 0:
            raise Exception('coef is a negative number')
    except ValueError:
        print("Error : wrong input - coef must be strictly positive")
    else:
        # open the image
        img = Image.open(png).convert("RGBA")
        
        # get the size of the image
        img_w, img_h = img.size

        # resize the image
        img = img.resize((int(img_w * coef), int(img_h * coef)))

        # save the resized image
        #img.show()
        img.save(png, 'png')

        # close the image
        img.close()

        return 


'''This function aims to change the color of a squared zone of a png'''
def colorize(png, rect, color, transparent = False):

    # test inputs
    try:
        # initialize the image to be transformed
        img = Image.open(png).convert('RGBA')
        img_data = np.asarray(img).copy()

        # retrieve the image size
        img_w, img_h = img.size

        # retrieve the rectangle coordinates
        x_min, y_min, x_max, y_max = rect

        if (x_min < 0 or x_max > img_w
            or y_min < 0 or y_max > img_h):
            raise Exception('the rectangle is too big for the image')
    except ValueError:
        print("Error : wrong input - rectangle coordinates must be in the image")
    else:
        ## get the grayscale of the image to add a gradient of colors
        #img_g = Image.open(png).convert('L')
    
        # loop over the pixels rectangle to change the color
        for x in range(x_min, x_max):
            for y in range(y_min, y_max):
                if (img_data[y][x][3] != 0):
                    pix = list(color)
                    if transparent: # make the png pixel transparent
                        pix.append(0)
                    else:
                        pix.append(img_data[y][x][3])
                    img_data[y][x] = tuple(pix)
        
        # create and show the new image
        img = Image.fromarray(img_data)
        #img.show()

        file_name = 'png_colorized.png'
        img.save(file_name, 'png')

        img.close()
        return file_name


colorized = transform_rgb('patterns/20230710_002239.jpg',85)


colorized = colorize(colorized, (0, 0, 717, 911), (0, 0, 0))
#colorized = colorize(colorized, (300, 564, 85, 385), (204, 0, 102))


image_resize(colorized, 0.5)

overlay(colorized, 'backgrounds/20230710_010428.jpg', (1775,1050), True)

#colorized = colorize(colorized, (400, 500, 350, 400), (153, 153, 255), True)

