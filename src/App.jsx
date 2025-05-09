import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 
import { toast } from "sonner"; // Mengubah import toast dari sonner langsung
import { 
  FaCat, 
  FaFish, 
  FaCheck, 
  FaShoppingBag, 
  FaHeart, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaBars
} from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
   const navigate = useNavigate(); 
  useEffect(() => {
    // Menampilkan toast selamat datang saat halaman dimuat
    toast("Welcome to MeowMeals! 😺", {
      description: "Premium cat food for your feline friend",
    });
    
    // Import Bootstrap JavaScript
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({
      behavior: "smooth",
    });
  };

  // Variabel animasi
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigasi */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="navbar navbar-expand-lg navbar-light bg-white fixed-top shadow-sm py-3"
      >
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <FaCat size={24} className="text-purple-500 me-2" />
            <span className="fw-bold">MeowMeals</span>
          </a>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <FaBars />
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {["products", "features", "testimonials", "contact"].map((item) => (
                <li className="nav-item" key={item}>
                  <button
                    onClick={() => scrollToSection(item)}
                    className="nav-link mx-2 text-capitalize"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li className="nav-item">
                <button className="btn btn-primary ms-2">Shop Now</button>
                {/* tombol ini akan menuju login */}

               <button 
                  className="btn btn-outline-primary ms-2"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>


              </li>
            </ul>
          </div>
        </div>
      </motion.nav>
      
      {/* Bagian Hero */}
      <section className="py-5 bg-light min-vh-100 d-flex align-items-center">
        <div className="container py-5 mt-5">
          <div className="row align-items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="col-lg-6 mb-5 mb-lg-0"
            >
              <h1 className="display-4 fw-bold mb-4">
                Premium Food For Your <span className="text-primary">Feline Friend</span>
              </h1>
              <p className="lead mb-4">
                Healthy, nutritious, and delicious cat food made with premium ingredients. 
                Because your cat deserves the best.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <button 
                  onClick={() => scrollToSection("products")}
                  className="btn btn-primary btn-lg px-4"
                >
                  Explore Products
                </button>
                <button 
                  onClick={() => scrollToSection("features")}
                  className="btn btn-outline-primary btn-lg px-4"
                >
                  Learn More
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="col-lg-6"
            >
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Cute cat with premium cat food"
                  className="img-fluid rounded-3 shadow"
                />
                <div className="position-absolute bottom-0 end-0 bg-white p-3 rounded shadow d-none d-md-block translate-middle-y">
                  <p className="fw-bold text-primary mb-0">100% Natural</p>
                  <p className="small text-muted">No artificial ingredients</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Bagian Produk */}
      <section id="products" className="py-5 bg-white">
        <div className="container py-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">Our Premium Products</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Discover our range of high-quality cat food, crafted with love and nutritionist-approved ingredients.
            </p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="row g-4"
          >
            {[
              {
                name: "Seafood Delight",
                description: "Premium seafood blend for adult cats",
                price: "$24.99",
                image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "Bestseller"
              },
              {
                name: "Chicken & Rice",
                description: "Easy to digest formula for sensitive cats",
                price: "$22.99",
                image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: "New"
              },
              {
                name: "Indoor Formula",
                description: "Special blend for less active indoor cats",
                price: "$26.99",
                image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                tag: ""
              }
            ].map((product, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="col-md-6 col-lg-4"
              >
                <div className="card h-100 border-0 shadow-sm">
                  <div className="position-relative">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="card-img-top"
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                    {product.tag && (
                      <div className="position-absolute top-0 end-0 bg-primary text-white m-3 px-3 py-1 rounded-pill small">
                        {product.tag}
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title h5 fw-bold">{product.name}</h3>
                    <p className="card-text text-muted">{product.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fs-5 fw-bold text-primary">{product.price}</span>
                      <button className="btn btn-sm btn-primary">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="text-center mt-4">
            <button className="btn btn-outline-primary">
              View All Products
            </button>
          </div>
        </div>
      </section>
      
      {/* Bagian Fitur */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">Why Choose Us?</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              We're committed to providing the highest quality nutrition for your beloved feline friends.
            </p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"
          >
            {[
              {
                icon: <FaFish size={32} />,
                title: "Premium Ingredients",
                description: "We source only the highest quality ingredients from trusted suppliers."
              },
              {
                icon: <FaCheck size={32} />,
                title: "Vet Approved",
                description: "All our recipes are developed and approved by veterinary nutritionists."
              },
              {
                icon: <FaHeart size={32} />,
                title: "Made With Love",
                description: "Every batch is prepared with care and attention to detail."
              },
              {
                icon: <FaShoppingBag size={32} />,
                title: "Free Delivery",
                description: "Free shipping on all orders over $50. Fast and reliable."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="col"
              >
                <div className="card h-100 text-center border-0 shadow-sm p-4">
                  <div className="text-primary mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="card-title h5 fw-bold">{feature.title}</h3>
                  <p className="card-text text-muted">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Bagian Testimoni */}
      <section id="testimonials" className="py-5 bg-white">
        <div className="container py-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">Happy Cat Parents</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Don't just take our word for it - hear from cat owners who've seen the difference.
            </p>
          </motion.div>
          
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="row g-4"
          >
            {[
              {
                name: "Sarah Johnson",
                role: "Owner of Whiskers",
                image: "https://randomuser.me/api/portraits/women/12.jpg",
                text: "My picky cat absolutely loves MeowMeals! I've noticed her coat is shinier and she has more energy since switching."
              },
              {
                name: "Michael Brown",
                role: "Owner of Luna",
                image: "https://randomuser.me/api/portraits/men/32.jpg",
                text: "The subscription service is so convenient, and the food quality is exceptional. My vet has noticed the improvement!"
              },
              {
                name: "Emma Wilson",
                role: "Owner of Oliver",
                image: "https://randomuser.me/api/portraits/women/23.jpg",
                text: "After trying numerous brands, I finally found MeowMeals. My cat runs to his bowl every time now! Highly recommend."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="col-md-4"
              >
                <div className="card h-100 bg-light border-0 p-4">
                  <div className="d-flex align-items-center mb-3">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="rounded-circle me-3"
                      width="60"
                      height="60"
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <h5 className="mb-0 fw-bold">{testimonial.name}</h5>
                      <p className="small text-muted mb-0">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="card-text fst-italic">"{testimonial.text}"</p>
                  <div className="d-flex mt-3">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className="text-warning me-1"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Bagian Kontak */}
      <section id="contact" className="py-5 bg-light">
        <div className="container py-5">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">Get In Touch</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: "700px" }}>
              Have questions about our products? We'd love to hear from you!
            </p>
          </motion.div>
          
          <div className="row g-4 justify-content-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="col-lg-5"
            >
              <h3 className="h4 fw-bold mb-4">Contact Information</h3>
              
              <div className="mb-4">
                <div className="d-flex align-items-start">
                  <div className="text-primary me-3 mt-1">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Email Us</p>
                    <a href="mailto:hello@meowmeals.com" className="text-primary">
                      hello@meowmeals.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="d-flex align-items-start">
                  <div className="text-primary me-3 mt-1">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Call Us</p>
                    <a href="tel:+15551234567" className="text-primary">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="d-flex align-items-start">
                  <div className="text-primary me-3 mt-1">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="fw-medium mb-0">Location</p>
                    <p className="text-muted">123 Cat Street, Purr City, CA 98765</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="col-lg-5"
            >
              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent successfully!", {
                  description: "We'll get back to you soon.",
                });
              }}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    id="name"
                    type="text"
                    className="form-control"
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="Your email"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="form-control"
                    placeholder="Your message"
                    required
                  ></textarea>
                </div>
                
                <button type="submit" className="btn btn-primary w-100">
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-dark text-white py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center mb-3">
                <FaCat size={24} className="text-primary me-2" />
                <span className="fw-bold fs-5">MeowMeals</span>
              </div>
              <p className="text-muted">
                Premium cat food made with love and care. Because your feline friend deserves the best.
              </p>
            </div>
            
            <div className="col-lg-4">
              <h5 className="mb-3">Quick Links</h5>
              <ul className="list-unstyled">
                {["Products", "About Us", "FAQs", "Shipping", "Returns"].map((item, index) => (
                  <li key={index} className="mb-2">
                    <a href="#" className="text-muted text-decoration-none hover-primary">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="col-lg-4">
              <h5 className="mb-3">Newsletter</h5>
              <p className="text-muted mb-3">
                Subscribe to our newsletter for promotions and cat care tips.
              </p>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Your email"
                />
                <button type="button" className="btn btn-primary">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-top border-secondary mt-4 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
            <p className="text-muted small mb-2 mb-md-0">
              © 2025 MeowMeals. All rights reserved.
            </p>
            <div className="d-flex gap-3">
              {["Facebook", "Instagram", "Twitter"].map((platform, index) => (
                <a key={index} href="#" className="text-muted text-decoration-none">
                  {platform}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Custom styles */}
      <style jsx>{`
        /* Override Bootstrap primary color */
        .btn-primary {
          background-color: #8A4FFF;
          border-color: #8A4FFF;
        }
        .btn-primary:hover,
        .btn-primary:focus {
          background-color: #7541E5;
          border-color: #7541E5;
        }
        .btn-outline-primary {
          color: #8A4FFF;
          border-color: #8A4FFF;
        }
        .btn-outline-primary:hover {
          background-color: #8A4FFF;
          border-color: #8A4FFF;
        }
        .text-primary {
          color: #8A4FFF !important;
        }
        .bg-primary {
          background-color: #8A4FFF !important;
        }
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        /* Other styling */
        .hover-primary:hover {
          color: #8A4FFF !important;
        }
      `}</style>
    </div>
  );
}

export default App;