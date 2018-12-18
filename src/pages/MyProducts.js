import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import faSearch from "@fortawesome/fontawesome-free-solid/faSearch";
import faList from "@fortawesome/fontawesome-free-solid/faList";
import faGroup from "@fortawesome/fontawesome-free-solid/faObjectGroup";

import AnnotatedSection from "../components/AnnotatedSection";
import Search from "../components/Search";

class MyProducts extends Component {
  constructor(props) {
    super(props);

    this.state = {
      products: []
    };
  }

  componentDidMount() {
    this.props.passageInstance
      .getOwnerProducts({ from: this.props.web3Accounts[0] })
      .then(result => {
        result.map(productId => {
          this.props.passageInstance
            .getProductById(String(productId).valueOf(), "latest")
            .then(result => {
              const product = {
                name: result[0],
                description: result[1],
                latitude: parseFloat(result[2]),
                longitude: parseFloat(result[3]),
                versionCreationDate: Date(result[4]),
                versions: result[5],
                id: productId
              };
              this.setState({ products: [...this.state.products, product] });
            })
            .catch(error => {
              console.log(error);
            });
          return false;
        });
      });
  }

  render() {
    const products = this.state.products.map((product, index) => {
      return (
        <Link key={index} to={`/products/${product.id}`}>
          <div key={index}>
            <b>{product.name || "Otpad"}</b> &mdash;{" "}
            {product.description || "Otpad"}
            <hr />
          </div>
        </Link>
      );
    });

    return (
      <div>
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faSearch}
              />
              Search waste
            </div>
          }
          panelContent={
            <div>
              <Search />
            </div>
          }
        />
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faList}
              />
              Lista otpada
              <Link style={{ marginLeft: "10px" }} to="/create">
                Napravi +
              </Link>
            </div>
          }
          panelContent={
            <div>
              {products && products.length > 0 ? (
                products
              ) : (
                <div>
                  Ne postoji registrovan otpad.
                  <Link style={{ marginLeft: "10px" }} to="/create">
                    Unesi Otpad
                  </Link>
                </div>
              )}
            </div>
          }
        />
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon
                fixedWidth
                style={{ paddingTop: "3px", marginRight: "6px" }}
                icon={faGroup}
              />
              Spoji otpad
            </div>
          }
          panelContent={
            <div>
              <div>
                <Link style={{ marginLeft: "10px" }} to="/combineList">
                  Preko liste
                </Link>
              </div>
              <div>
                <Link style={{ marginLeft: "10px" }} to="/combineScan">
                  Preko QR koda
                </Link>
              </div>
            </div>
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    passageInstance: state.reducer.passageInstance,
    productIdToView: state.reducer.productIdToView,
    web3Accounts: state.reducer.web3Accounts
  };
}

export default connect(mapStateToProps)(MyProducts);
