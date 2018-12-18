import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import { Button, FormGroup, Input, Label } from 'reactstrap';
import AnnotatedSection from '../components/AnnotatedSection'
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faStar from '@fortawesome/fontawesome-free-solid/faStar'

class Create extends Component {

  constructor(props) {
    super(props);

    // initialize the component's state
    this.state = {
      name: '',
      description: '',
      latitude: '',
      longitude: '',
      address: '',
      availableCertifications: [],
      selectedCertifications: {},
      customDataInputs: {},
      selectedCategories: {},
      buttonDisabled: false,

      selectedCategory: null,
      selectedSubcategory: null,
      format: null,
      type: null,
      weight: null,
    };
    this.onChange = (address) => this.setState({address})
  }

  // when the page is loaded, fetch all available certifications
  componentDidMount() {
    this.props.passageInstance.getActorCertificationsIds({from: this.props.web3Accounts[0]})
      .then((result) => {
        result.map((certificationId) => {
          return this.props.passageInstance.getCertificationById(String(certificationId).valueOf())
            .then((result) => {
              const certification = {
                name: result[0],
                imageUrl: result[1],
                id: certificationId,
              };
              return this.setState({availableCertifications: [...this.state.availableCertifications, certification]})
            });
        });
      })
  }

  // method that updates the state when a certification is checked/unchecked
  handleChange = (e) => {
    const certificationId = e.target.name;
    this.setState({selectedCertifications: {...this.state.selectedCertifications, [certificationId]: e.target.checked}})
  };

  productDescription = (product) => {
    if (!product.Kategorija) {
      return "Otpad"
    }

    return `${product.Podkategorija} - ${product["Kolicina (kg)"]} kg`
  };

  // method that sends the new product's information to the smart contract
  handleCreateNewProduct = () => {
    // generate a 'clean' representation of the selected certifications
    const selectedCertifications = this.state.selectedCertifications;
    const certificationsArray = [];
    Object.keys(selectedCertifications).map(key => {
      if (selectedCertifications[key] === true) {
        return certificationsArray.push(key)
      }
      return false;
    });

    var customDataObject = {};
    Object.keys(this.state.customDataInputs).map(inputKey => {
      const input = this.state.customDataInputs[inputKey];
      if (input.key.trim() !== "" && input.value.trim() !== "") {
        customDataObject[input.key] = input.value;
      }
      return false;
    });

    customDataObject["Vlasnik"] = "Komanija A DOO";
    customDataObject["Kategorija"] = this.state.selectedCategory;
    customDataObject["Podkategorija"] = this.state.selectedSubcategory;
    customDataObject["Tip Otpada"] = this.state.type;
    customDataObject["Vrsta Otpada"] = this.state.vrsta;
    customDataObject["Pripadnost Q Listi"] = this.state.qlista;
    customDataObject["Nacin Pakovanja"] = this.state.format;
    customDataObject["Kolicina (kg)"] = this.state.weight;
    customDataObject["Faza"] = "Baliranje";


    // actually call the smart contract method
    this.props.passageInstance.createProduct(
      this.state.name,
      this.productDescription(customDataObject),
      this.state.latitude.toString(),
      this.state.longitude.toString(),
      certificationsArray,
      JSON.stringify(customDataObject), {
        from: this.props.web3Accounts[0],
        gas: 1000000
      })
  };

  handleGeoSelect = (address) => {
    this.setState({address, buttonDisabled: true});

    geocodeByAddress(this.state.address)
      .then(results => getLatLng(results[0]))
      .then(latLng => {
        this.setState({latitude: latLng.lat, longitude: latLng.lng, buttonDisabled: false})
      })
      .catch(error => console.error('Error', error))
  };

  // reflected on the page by the render() function
  appendInput(key = "", value = "") {
    var newInputKey = `input-${Object.keys(this.state.customDataInputs).length}`; // this might not be a good idea (e.g. when removing then adding more inputs)
    this.setState({customDataInputs: {...this.state.customDataInputs, [newInputKey]: {key: key, value: value}}});
  }

  updateInputState = (name) => (e) => {
    this.setState({
      [name]: e.target.value
    })
  };

  render() {
    return (
      <div>
        <AnnotatedSection
          annotationContent={
            <div>
              <FontAwesomeIcon fixedWidth style={ {paddingTop: "3px", marginRight: "6px"} } icon={ faStar }/>
              Unos otpada
            </div>
          }
          panelContent={
            <div>
              <FormGroup>
                <Label>Sifra otpada</Label>
                <Input placeholder="Sifra otpada" value={ this.state.name } onChange={ this.updateInputState("name") }/>
              </FormGroup>
              <FormGroup>
                <Label>Vlasnik</Label>
                <Input disabled placeholder="Vlasnik" value={ "Kompanija A DOO" }/>
              </FormGroup>
              <FormGroup>
                <Label>Klasifikacija otpada</Label>
                <Input type="select" defaultValue="" onChange={ this.updateInputState("selectedCategory") }>
                  <option disabled value="" key="none">(izaberite)</option>
                  <option value="PET" key="PET">PET</option>
                  <option value="HDPE" key="HDPE">HDPE</option>
                  <option value="PVC" key="PVC">PVC</option>
                  <option value="LDPE" key="LDPE">LDPE</option>
                  <option value="PP" key="PP">PP</option>
                  <option value="PS" key="PS">PS</option>
                  <option value="Ostalo" key="Ostalo">Ostalo</option>
                </Input>
                { this.state.selectedCategory &&
                <Input type="select"
                       defaultValue=""
                       onChange={ this.updateInputState("selectedSubcategory") }
                       style={ {marginTop: 10} }>
                  <option disabled value="" key="none">(izaberite)</option>
                  <option value="15 01 02 - Plastična ambalaža" key="15 01 02 - Plastična ambalaža">
                    15 01 02 - Plastična ambalaža
                  </option>
                  <option value="15 01 06 Mešana ambalaža" key="15 01 06 Mešana ambalaža">
                    15 01 06 Mešana ambalaža
                  </option>
                  <option value="02 01 04 - Otpadna plastika" key="02 01 04 - Otpadna plastika">
                    02 01 04 - Otpadna plastika
                  </option>
                </Input> }
              </FormGroup>
              <FormGroup>
                <Label>Vrsta otpada</Label>
                <Input type="select" defaultValue="" onChange={ this.updateInputState("vrsta") }>
                  <option disabled value="">(izaberite)</option>
                  <option value="Komercijalni">Komercijalni</option>
                  <option value="Industrijski">Industrijski</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Pripadnost Q Listi</Label>
                <Input type="select" defaultValue="" onChange={ this.updateInputState("qlista") }>
                  <option disabled value="">(izaberite)</option>
                  <option value="Q1 - Ostaci od proizvodnje ili potrošnje koji nisu drugačije specificirani">
                    Q1 - Ostaci od proizvodnje ili potrošnje koji nisu drugačije specificirani
                  </option>
                  <option value="Q2 - Proizvodi bez specifikacija">
                    Q2 - Proizvodi bez specifikacija
                  </option>
                  <option value="Q3 - Proizvodi čiji je rok upotrebe istekao">
                    Q3 - Proizvodi čiji je rok upotrebe istekao
                  </option>
                  <option value="Q4 - Prosuti materijali, materijali koji su nastali usled gubitka ili nezgode pri postupanju
sa njima, uključujući sve materijale, opremu i sl. kontaminirane pri nezgodi">
                    Q4 - Prosuti materijali, materijali koji su nastali usled gubitka ili nezgode pri postupanju
                    sa njima, uključujući sve materijale, opremu i sl. kontaminirane pri nezgodi
                  </option>
                  <option value="Q5 - Kontaminirani ili zaprljani materijali nastali u toku planiranog postupka (npr.
ostaci od postupaka čišćenja, materijali za pakovanje, kontejneri)">
                    Q5 - Kontaminirani ili zaprljani materijali nastali u toku planiranog postupka (npr.
                    ostaci od postupaka čišćenja, materijali za pakovanje, kontejneri)
                  </option>
                  <option value="Q6 - Neupotrebljivi delovi (npr. istrošene baterije, katalizatori i dr.)">
                    Q6 - Neupotrebljivi delovi (npr. istrošene baterije, katalizatori i dr.)
                  </option>
                  <option value="Q7 - Supstance koje više ne zadovoljavaju (npr. kontaminirane kiseline ili rastvarači,
istrošene soli za termičku obradu i dr.)">
                    Q7 - Supstance koje više ne zadovoljavaju (npr. kontaminirane kiseline ili rastvarači,
                    istrošene soli za termičku obradu i dr.)
                  </option>
                  <option value="Q8 - Ostaci iz industrijskih procesa (npr. šljaka, destilacioni talozi i dr.)">
                    Q8 - Ostaci iz industrijskih procesa (npr. šljaka, destilacioni talozi i dr.)
                  </option>
                  <option value="Q9 - Ostaci iz procesa za smanjenje zagađenja (npr. mulj iz uređaja za vlažno
prečišćavanje gasova, prašina iz vrećastih filtera, potrošeni filteri)">
                    Q9 - Ostaci iz procesa za smanjenje zagađenja (npr. mulj iz uređaja za vlažno
                    prečišćavanje gasova, prašina iz vrećastih filtera, potrošeni filteri)
                  </option>
                  <option value="Q10 - Ostaci od mašinske grube/fine obrade (npr. strugotine, opiljci i otpaci od glodanja i
sl.)">
                    Q10 - Ostaci od mašinske grube/fine obrade (npr. strugotine, opiljci i otpaci od glodanja i
                    sl.)
                  </option>
                  <option
                    value="Q11 - Ostaci od ekstrakcije i prerade sirovina (npr. otpad iz rudarstva, naftne isplake i dr.)">
                    Q11 - Ostaci od ekstrakcije i prerade sirovina (npr. otpad iz rudarstva, naftne isplake i dr.)
                  </option>
                  <option value="Q12 - Materijali čiji je prvobitni sastav iskvaren (npr. ulje zagađeno polihlorovanim
bifenilima - RSV i dr.)">
                    Q12 - Materijali čiji je prvobitni sastav iskvaren (npr. ulje zagađeno polihlorovanim
                    bifenilima - RSV i dr.)
                  </option>
                  <option value="Q13 - Svaka materija, materijal ili proizvod čije je korišćenje zabranjeno">
                    Q13 - Svaka materija, materijal ili proizvod čije je korišćenje zabranjeno
                  </option>
                  <option value="Q14 - Proizvodi koje njihov vlasnik odbacuje kao neupotrebljive (npr.
poljoprivredni otpad, otpad iz domaćinstva, kancelarijski, komercijalni i otpad iz
trgovina i sl.)">
                    Q14 - Proizvodi koje njihov vlasnik odbacuje kao neupotrebljive (npr.
                    poljoprivredni otpad, otpad iz domaćinstva, kancelarijski, komercijalni i otpad iz
                    trgovina i sl.)
                  </option>
                  <option value="Q15 - Kontaminirani materijali, materije ili proizvodi nastali u procesu remedijacije
zemljišta">
                    Q15 - Kontaminirani materijali, materije ili proizvodi nastali u procesu remedijacije
                    zemljišta
                  </option>
                  <option value="Q16 - Bilo koji drugi materijali, materije ili proizvodi koji nisu obuhvaćeni u gore
navedenim kategorijama">
                    Q16 - Bilo koji drugi materijali, materije ili proizvodi koji nisu obuhvaćeni u gore
                    navedenim kategorijama
                  </option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Nacin Pakovanja</Label>
                <Input type="select" defaultValue="" onChange={ this.updateInputState("format") }>
                  <option disabled value="">(izaberite)</option>
                  <option value="Bala">Bala</option>
                  <option value="Rinfuz">Rinfuz</option>
                  <option value="Drveno Bure">Drveno Bure</option>
                  <option value="Kanister">Kanister</option>
                  <option value="Sanduk">Sanduk</option>
                  <option value="Kesa">Kesa</option>
                  <option value="Posude pod pritiskom">Posude pod pritiskom</option>
                  <option value="Kompozitno pakovanje">Kompozitno pakovanje</option>
                  <option value="Rasuto stanje">Rasuto stanje</option>
                  <option value="Ostalo">Ostalo</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Tip Otpada</Label>
                <Input type="select" defaultValue="" onChange={ this.updateInputState("type") }>
                  <option disabled value="">(izaberite)</option>
                  <option value="Opasan otpad">Opasan otpad</option>
                  <option value="Neopasan otpad">Neopasan otpad</option>
                  <option value="Energent">Energent</option>
                  <option value="Reciklat">Reciklat</option>
                </Input>
              </FormGroup>
              <FormGroup>
                <Label>Kolicina (kg)</Label>
                <Input placeholder='npr. 1000' type='number' value={ this.state.weight || '' }
                       onChange={ this.updateInputState("weight") }/>
              </FormGroup>

              <FormGroup>
                <Label>Lokacija</Label>
                <PlacesAutocomplete
                  inputProps={ {
                    value: this.state.address,
                    onChange: this.onChange,
                    placeholder: "Tacna lokacija"
                  } }
                  onSelect={ this.handleGeoSelect }
                  classNames={ {input: "form-control"} }
                />
              </FormGroup>
              <FormGroup>
                {
                  // displays all custom data fields from the state
                  Object.keys(this.state.customDataInputs).map(inputKey =>
                    <FormGroup style={ {display: "flex"} } key={ inputKey }>
                      <Input value={ this.state.customDataInputs[inputKey].key } placeholder="Osobina (npr. boja)"
                             style={ {flex: 1, marginRight: "15px"} } onChange={ (e) => {
                        this.setState({
                          customDataInputs: {
                            ...this.state.customDataInputs,
                            [inputKey]: {...this.state.customDataInputs[inputKey], key: e.target.value}
                          }
                        })
                      } }/>
                      <Input value={ this.state.customDataInputs[inputKey].value } placeholder="Vrednost (npr. crvena)"
                             style={ {flex: 1} } onChange={ (e) => {
                        this.setState({
                          customDataInputs: {
                            ...this.state.customDataInputs,
                            [inputKey]: {...this.state.customDataInputs[inputKey], value: e.target.value}
                          }
                        })
                      } }/>
                    </FormGroup>
                  )
                }
                <Link to="#" onClick={ () => this.appendInput() }>
                  Unesi dodatne informacije
                </Link>
              </FormGroup>
              <FormGroup>
                <Label>
                  Dozvole za upravljanje otpadom
                  <Link style={ {marginLeft: "10px"} } to="/createcertification">Dodaj +</Link>
                </Label>
                <div>
                  {
                    // displays all available certifications
                    this.state.availableCertifications && this.state.availableCertifications.length > 0 ?
                      this.state.availableCertifications.map((certification, index) =>
                        <div key={ index }>
                          <input style={ {marginRight: "5px"} } onChange={ this.handleChange } name={ certification.id }
                                 type="checkbox"/>
                          <span>{ certification.name }</span>
                        </div>
                      )
                      :
                      <div style={ {marginLeft: "15px"} }>
                        Nema dostupnih dozvola.
                        <Link style={ {marginLeft: "10px"} } to="/createcertification">Unesi dozvolu</Link>
                      </div>
                  }
                </div>
              </FormGroup>
              <Button disabled={ this.state.buttonDisabled } color="primary"
                      onClick={ this.handleCreateNewProduct }>Sacuvaj</Button>
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
    web3Accounts: state.reducer.web3Accounts
  };
}

export default connect(mapStateToProps)(Create);
